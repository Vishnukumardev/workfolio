// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase"; // Import Firebase auth and db
import { collection, getDocs, query, where } from "firebase/firestore";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // For image viewer
  const [isModalOpen, setIsModalOpen] = useState(false); // To track modal state
  
  const navigate = useNavigate(); // Initialize navigation

  // Fetch employee data
  const fetchEmployees = async () => {
    const employeesCollection = collection(db, "users");
    const employeesSnapshot = await getDocs(employeesCollection);
    const employeesList = employeesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(employee => employee.role !== "admin"); // Exclude admin accounts
    setEmployees(employeesList);
  };

  // Fetch screenshots and work data for the selected employee
  const fetchEmployeeData = async () => {
    if (!selectedEmployee) return;

    const screenshotsQuery = query(
      collection(db, "screenshots"), // Ensure your screenshots are stored in a collection called "screenshots"
      where("userId", "==", selectedEmployee)
    );

    const screenshotsSnapshot = await getDocs(screenshotsQuery);
    const screenshotsList = screenshotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalTimeWorked = screenshotsList.reduce((total, screenshot) => {
      // Calculate total time from screenshots; assuming you store the time worked in the screenshot data
      return total + screenshot.timeWorked; // Adjust this as necessary based on your data structure
    }, 0);

    const totalBreakTime = screenshotsList.reduce((total, screenshot) => {
      // Calculate total break time; assuming you store break time in screenshot data
      return total + screenshot.breakTime; // Adjust as necessary
    }, 0);

    setFilteredData({ screenshots: screenshotsList, totalTimeWorked, totalBreakTime });
  };

  // Filter data based on date range
  const handleFilter = () => {
    if (!startDate || !endDate || !selectedEmployee) {
      alert("Please select an employee and a date range.");
      return;
    }

    const filtered = filteredData.screenshots.filter(screenshot => {
      const screenshotDate = new Date(screenshot.timestamp); // Assuming timestamp is stored as a field in your data
      return screenshotDate >= new Date(startDate) && screenshotDate <= new Date(endDate);
    });

    setFilteredData(prev => ({
      ...prev,
      screenshots: filtered,
    }));
  };

  // Handle logout functionality
  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login'); // Navigate back to login screen after logout
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  // Open modal with selected image
  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(null);
  };

  // Navigate through images
  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % filteredData.screenshots.length
    );
  };

  const showPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + filteredData.screenshots.length) % filteredData.screenshots.length
    );
  };

  useEffect(() => {
    fetchEmployees(); // Fetch employees on component mount
  }, []);

  useEffect(() => {
    fetchEmployeeData(); // Fetch employee data whenever the selected employee changes
  }, [selectedEmployee]);

  return (
    <div className="p-6">
      {/* Logout Button at the top left */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded absolute top-4 right-4"
      >
        Logout
      </button>

      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="mb-4">
        <label htmlFor="employeeSelect" className="block mb-2">Select Employee:</label>
        <select
          id="employeeSelect"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border p-2"
        >
          <option value="">-- Select Employee --</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>{employee.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="startDate" className="block mb-2">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="endDate" className="block mb-2">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2"
        />
      </div>

      <button onClick={handleFilter} className="bg-blue-600 text-white py-2 px-4 rounded">
        Filter
      </button>

      <h2 className="text-xl font-bold mt-6">Employee Data</h2>
      <p>Total Time Worked: {filteredData.totalTimeWorked} seconds</p>
      <p>Total Break Time: {filteredData.totalBreakTime} seconds</p>

      <h3 className="mt-4">Screenshots</h3>
      {filteredData.screenshots && filteredData.screenshots.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Screenshot</th>
              <th className="border border-gray-300 px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.screenshots.map((screenshot, index) => (
              <tr key={screenshot.id}>
                <td className="border border-gray-300 px-4 py-2">
                  <img
                    src={screenshot.url}
                    alt={`Screenshot at ${screenshot.timestamp}`}
                    className="h-20 w-20 object-cover cursor-pointer"
                    onClick={() => openImageViewer(index)} // Click to open viewer
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(screenshot.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No screenshots available for the selected employee in this date range.</p>
      )}

      {/* Image Viewer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
          <div className="relative">
            <img
              src={filteredData.screenshots[currentImageIndex].url}
              alt={`Screenshot at ${filteredData.screenshots[currentImageIndex].timestamp}`}
              className="max-w-full max-h-full"
            />
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <button
              className="absolute top-1/2 left-2 text-white text-2xl"
              onClick={showPreviousImage}
            >
              &#8592;
            </button>
            <button
              className="absolute top-1/2 right-2 text-white text-2xl"
              onClick={showNextImage}
            >
              &#8594;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
