import { useState, useEffect } from "react";
import api from "../../api/axios";
import { format } from "date-fns";

const RoomAvailabilityManagement = () => {
  const [roomList, setRoomList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [workSchedule, setWorkSchedule] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [tempSchedule, setTempSchedule] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: "",
    reason: "maintenance",
    notes: "",
  });

  const dayNames = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const reasonOptions = [
    { label: "Maintenance", value: "maintenance" },
    { label: "Cleaning", value: "cleaning" },
    { label: "Closure", value: "closure" },
    { label: "Other", value: "other" },
  ];

  // Fetch room list on mount
  useEffect(() => {
    fetchRoomList();
  }, []);

  const fetchRoomList = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/resources/rooms");
      setRoomList(response.data.rooms || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = async (room) => {
    try {
      setError("");
      setSelectedRoom(room);

      // Fetch work schedule
      const scheduleRes = await api.get(
        `/availability/rooms/${room._id}/work-schedule`
      );
      setWorkSchedule(scheduleRes.data.workSchedule);

      // Fetch unavailable dates
      const unavailableRes = await api.get(
        `/availability/rooms/${room._id}/unavailable-dates`
      );
      setUnavailableDates(unavailableRes.data.unavailableDates);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load room availability"
      );
    }
  };

  const handleOpenScheduleModal = () => {
    setTempSchedule(JSON.parse(JSON.stringify(workSchedule)));
    setShowScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setTempSchedule(null);
  };

  const handleScheduleChange = (day, field, value) => {
    setTempSchedule({
      ...tempSchedule,
      [day]: {
        ...tempSchedule[day],
        [field]: value,
      },
    });
  };

  const handleSaveSchedule = async () => {
    try {
      setError("");
      setSuccess("");

      await api.put(`/availability/rooms/${selectedRoom._id}/work-schedule`, {
        workSchedule: tempSchedule,
      });

      setWorkSchedule(tempSchedule);
      setSuccess("Room schedule updated successfully!");
      setShowScheduleModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update room schedule"
      );
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (!maintenanceForm.date) {
        setError("Please select a date");
        return;
      }

      await api.post(
        `/availability/rooms/${selectedRoom._id}/unavailable-dates`,
        maintenanceForm
      );

      setSuccess("Maintenance date added successfully!");
      setMaintenanceForm({ date: "", reason: "maintenance", notes: "" });
      setShowMaintenanceModal(false);

      // Refresh unavailable dates
      const res = await api.get(
        `/availability/rooms/${selectedRoom._id}/unavailable-dates`
      );
      setUnavailableDates(res.data.unavailableDates);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add maintenance date"
      );
    }
  };

  const handleDeleteMaintenance = async (dateId) => {
    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/availability/rooms/${selectedRoom._id}/unavailable-dates/${dateId}`
      );

      setSuccess("Maintenance date deleted successfully!");
      const res = await api.get(
        `/availability/rooms/${selectedRoom._id}/unavailable-dates`
      );
      setUnavailableDates(res.data.unavailableDates);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete maintenance date"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Room Availability Management
          </h1>
          <p className="text-gray-600">
            Manage room schedules and maintenance dates
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Room List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Rooms</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {roomList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No rooms found
                  </div>
                ) : (
                  roomList.map((room) => (
                    <button
                      key={room._id}
                      onClick={() => handleSelectRoom(room)}
                      className={`w-full px-6 py-4 text-left border-b transition-colors ${
                        selectedRoom?._id === room._id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{room.name}</p>
                      <p className="text-sm text-gray-500">
                        {room.location || "No location"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Room Availability Details */}
          {selectedRoom && workSchedule && (
            <div className="lg:col-span-3 space-y-6">
              {/* Work Schedule Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Room Availability Hours
                  </h2>
                  <button
                    onClick={handleOpenScheduleModal}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Edit Schedule
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dayNames.map((day) => {
                      const schedule = workSchedule[day];
                      return (
                        <div
                          key={day}
                          className={`p-4 rounded-lg border-2 ${
                            schedule.isWorking
                              ? "border-blue-200 bg-blue-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <p className="font-semibold text-gray-900 capitalize mb-2">
                            {day}
                          </p>
                          {schedule.isWorking ? (
                            <p className="text-sm text-blue-700 font-medium">
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Closed</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Maintenance / Unavailable Dates Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Maintenance & Closures
                  </h2>
                  <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    + Add Closure
                  </button>
                </div>

                <div className="p-6">
                  {unavailableDates.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No maintenance or closure scheduled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {unavailableDates.map((maintenance) => {
                        const reasonMap = {
                          maintenance: "🔧 Maintenance",
                          cleaning: "🧹 Cleaning",
                          closure: "🚫 Closure",
                          other: "📅 Unavailable",
                        };

                        return (
                          <div
                            key={maintenance._id}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {format(
                                  new Date(maintenance.date),
                                  "MMM dd, yyyy"
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {
                                  reasonMap[maintenance.reason] ||
                                  "Unavailable"
                                }
                              </p>
                              {maintenance.notes && (
                                <p className="text-sm text-gray-500 italic">
                                  {maintenance.notes}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteMaintenance(maintenance._id)
                              }
                              className="text-red-600 hover:text-red-800 font-medium transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedRoom && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4 2 2 0 000 4zM9 7h4m0 0V5m0 2v2m0-4h.581m15.356 2H9.75m0 0a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">
                  Select a room to view and manage its availability
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Schedule Modal */}
      {showScheduleModal && tempSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h3 className="text-2xl font-bold text-white">
                Edit Room Availability
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {dayNames.map((day) => (
                <div key={day} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-lg font-semibold text-gray-900 capitalize">
                      {day}
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSchedule[day].isWorking}
                        onChange={(e) =>
                          handleScheduleChange(
                            day,
                            "isWorking",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-gray-700">Available</span>
                    </label>
                  </div>

                  {tempSchedule[day].isWorking && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From
                        </label>
                        <input
                          type="time"
                          value={tempSchedule[day].startTime}
                          onChange={(e) =>
                            handleScheduleChange(
                              day,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To
                        </label>
                        <input
                          type="time"
                          value={tempSchedule[day].endTime}
                          onChange={(e) =>
                            handleScheduleChange(
                              day,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
              <button
                onClick={handleCloseScheduleModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 font-medium transition-all duration-300"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h3 className="text-2xl font-bold text-white">
                Add Maintenance / Closure
              </h3>
            </div>

            <form onSubmit={handleAddMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={maintenanceForm.date}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      date: e.target.value,
                    })
                  }
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={maintenanceForm.reason}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      reason: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={maintenanceForm.notes}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 font-medium transition-all duration-300"
                >
                  Add Closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAvailabilityManagement;
