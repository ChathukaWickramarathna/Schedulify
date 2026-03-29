import { useState, useEffect } from "react";
import api from "../../api/axios";
import { format } from "date-fns";

const StaffAvailabilityManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [workSchedule, setWorkSchedule] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [tempSchedule, setTempSchedule] = useState(null);
  const [timeOffForm, setTimeOffForm] = useState({
    date: "",
    reason: "other",
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
    { label: "Holiday", value: "holiday" },
    { label: "Sick Leave", value: "sick_leave" },
    { label: "Annual Leave", value: "annual_leave" },
    { label: "Personal Leave", value: "personal" },
    { label: "Other", value: "other" },
  ];

  // Fetch staff list on mount
  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/resources/staff");
      setStaffList(response.data.staff || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load staff members"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = async (staff) => {
    try {
      setError("");
      setSelectedStaff(staff);

      // Fetch work schedule
      const scheduleRes = await api.get(
        `/availability/staff/${staff._id}/work-schedule`
      );
      setWorkSchedule(scheduleRes.data.workSchedule);

      // Fetch unavailable dates
      const unavailableRes = await api.get(
        `/availability/staff/${staff._id}/unavailable-dates`
      );
      setUnavailableDates(unavailableRes.data.unavailableDates);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load staff availability"
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

      await api.put(`/availability/staff/${selectedStaff._id}/work-schedule`, {
        workSchedule: tempSchedule,
      });

      setWorkSchedule(tempSchedule);
      setSuccess("Work schedule updated successfully!");
      setShowScheduleModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update work schedule"
      );
    }
  };

  const handleAddTimeOff = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (!timeOffForm.date) {
        setError("Please select a date");
        return;
      }

      await api.post(
        `/availability/staff/${selectedStaff._id}/unavailable-dates`,
        timeOffForm
      );

      setSuccess("Time off added successfully!");
      setTimeOffForm({ date: "", reason: "other", notes: "" });
      setShowTimeOffModal(false);

      // Refresh unavailable dates
      const res = await api.get(
        `/availability/staff/${selectedStaff._id}/unavailable-dates`
      );
      setUnavailableDates(res.data.unavailableDates);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add time off");
    }
  };

  const handleDeleteTimeOff = async (dateId) => {
    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/availability/staff/${selectedStaff._id}/unavailable-dates/${dateId}`
      );

      setSuccess("Time off deleted successfully!");
      const res = await api.get(
        `/availability/staff/${selectedStaff._id}/unavailable-dates`
      );
      setUnavailableDates(res.data.unavailableDates);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete time off");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Staff Availability Management
          </h1>
          <p className="text-gray-600">
            Manage work schedules and time off for staff members
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
          {/* Staff List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Staff Members</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {staffList.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No staff members found
                  </div>
                ) : (
                  staffList.map((staff) => (
                    <button
                      key={staff._id}
                      onClick={() => handleSelectStaff(staff)}
                      className={`w-full px-6 py-4 text-left border-b transition-colors ${
                        selectedStaff?._id === staff._id
                          ? "bg-purple-50 border-l-4 border-purple-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{staff.name}</p>
                      <p className="text-sm text-gray-500">{staff.email}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Staff Availability Details */}
          {selectedStaff && workSchedule && (
            <div className="lg:col-span-3 space-y-6">
              {/* Work Schedule Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Weekly Work Schedule
                  </h2>
                  <button
                    onClick={handleOpenScheduleModal}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <p className="font-semibold text-gray-900 capitalize mb-2">
                            {day}
                          </p>
                          {schedule.isWorking ? (
                            <p className="text-sm text-green-700 font-medium">
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Not Working</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Off / Unavailable Dates Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Time Off & Unavailable Dates
                  </h2>
                  <button
                    onClick={() => setShowTimeOffModal(true)}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    + Add Time Off
                  </button>
                </div>

                <div className="p-6">
                  {unavailableDates.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No time off scheduled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {unavailableDates.map((timeOff) => {
                        const reasonMap = {
                          holiday: "🎉 Holiday",
                          sick_leave: "🏥 Sick Leave",
                          annual_leave: "🏖️ Annual Leave",
                          personal: "👤 Personal Leave",
                          other: "📅 Time Off",
                        };

                        return (
                          <div
                            key={timeOff._id}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {format(
                                  new Date(timeOff.date),
                                  "MMM dd, yyyy"
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {
                                  reasonMap[timeOff.reason] || "Time Off"
                                }
                              </p>
                              {timeOff.notes && (
                                <p className="text-sm text-gray-500 italic">
                                  {timeOff.notes}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteTimeOff(timeOff._id)
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
          {!selectedStaff && (
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
                    d="M12 4.354a4 4 0 110 5.292M15 13H9m0 0l3-3m-3 3l-3-3m3 3v6m-9-9h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg">
                  Select a staff member to view and manage their availability
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
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h3 className="text-2xl font-bold text-white">
                Edit Work Schedule
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
                      <span className="text-gray-700">Working</span>
                    </label>
                  </div>

                  {tempSchedule[day].isWorking && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-all duration-300"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Time Off Modal */}
      {showTimeOffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h3 className="text-2xl font-bold text-white">Add Time Off</h3>
            </div>

            <form onSubmit={handleAddTimeOff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={timeOffForm.date}
                  onChange={(e) =>
                    setTimeOffForm({ ...timeOffForm, date: e.target.value })
                  }
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={timeOffForm.reason}
                  onChange={(e) =>
                    setTimeOffForm({ ...timeOffForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  value={timeOffForm.notes}
                  onChange={(e) =>
                    setTimeOffForm({ ...timeOffForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowTimeOffModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-all duration-300"
                >
                  Add Time Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAvailabilityManagement;
