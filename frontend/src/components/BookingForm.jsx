import { useState, useEffect } from "react";
import api from "../api/axios";

const BookingForm = ({ onSuccess, onCancel }) => {
  // Form state
  const [formData, setFormData] = useState({
    service: "",
    assignedStaff: "",
    room: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  // Available options from backend
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rooms, setRooms] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);
  const [error, setError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [unavailableDateReasons, setUnavailableDateReasons] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Fetch available services, staff, and rooms on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        const [servicesRes, staffRes, roomsRes] = await Promise.all([
          api.get("/public/services"),
          api.get("/public/staff"),
          api.get("/public/rooms"),
        ]);

        setServices(servicesRes.data.services || []);
        setStaff(staffRes.data.staff || []);
        setRooms(roomsRes.data.rooms || []);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError(err.response?.data?.message || "Failed to load booking options");
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  // Fetch available dates when service and staff are selected
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!formData.service || !formData.assignedStaff) {
        setAvailableDates([]);
        setUnavailableDateReasons({});
        setFormData((prev) => ({ ...prev, date: "", startTime: "", endTime: "" }));
        return;
      }

      try {
        setLoadingDates(true);
        const response = await api.get("/bookings/available-dates", {
          params: {
            serviceId: formData.service,
            staffId: formData.assignedStaff,
            daysAhead: 60,
          },
        });

        setAvailableDates(response.data.availableDates || []);
        setUnavailableDateReasons(response.data.unavailableDateReasons || {});
      } catch (err) {
        console.error("Error fetching available dates:", err);
        setAvailableDates([]);
        setUnavailableDateReasons({});
      } finally {
        setLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, [formData.service, formData.assignedStaff]);

  // Check available slots when service, date, and staff are selected
  useEffect(() => {
    const checkAvailableSlots = async () => {
      // Need service, date, and staff to check availability
      if (!formData.service || !formData.date || !formData.assignedStaff) {
        setAvailableSlots([]);
        return;
      }

      try {
        setCheckingSlots(true);
        const selectedService = services.find((s) => s._id === formData.service);
        const serviceDuration = selectedService?.duration || 60;

        const response = await api.get("/bookings/available-slots", {
          params: {
            staffId: formData.assignedStaff,
            date: formData.date,
            serviceDuration,
          },
        });

        setAvailableSlots(response.data.availableSlots || []);
      } catch (err) {
        console.error("Error checking available slots:", err);
        setAvailableSlots([]);
      } finally {
        setCheckingSlots(false);
      }
    };

    checkAvailableSlots();
  }, [formData.service, formData.date, formData.assignedStaff, services]);

  // Auto-fill end time when start time is selected
  useEffect(() => {
    if (formData.startTime && formData.service) {
      const selectedService = services.find((s) => s._id === formData.service);
      if (selectedService && selectedService.duration) {
        const [hours, minutes] = formData.startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + selectedService.duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
        setFormData((prev) => ({ ...prev, endTime }));
      }
    }
  }, [formData.startTime, formData.service, services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleDateSelect = (dateString) => {
    setFormData((prev) => ({
      ...prev,
      date: dateString,
      startTime: "",
      endTime: "",
    }));
    setError("");
  };

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  // Helper function to check if a date is available
  const isDateAvailable = (dateString) => {
    return availableDates.includes(dateString);
  };

  // Helper function to get reason for unavailable date
  const getUnavailableDateReason = (dateString) => {
    return unavailableDateReasons[dateString];
  };

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.service || !formData.date || !formData.startTime || !formData.endTime) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.assignedStaff) {
      setError("Please select a staff member");
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        service: formData.service,
        assignedStaff: formData.assignedStaff,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      };

      if (formData.room) {
        bookingData.room = formData.room;
      }

      const response = await api.post("/bookings", bookingData);

      // Reset form
      setFormData({
        service: "",
        assignedStaff: "",
        room: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      setError(err.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      service: "",
      assignedStaff: "",
      room: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    });
    setError("");
    setAvailableSlots([]);
    setAvailableDates([]);
    setCalendarMonth(new Date());
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  // Get selected service details for displaying duration
  const selectedService = services.find((s) => s._id === formData.service);

  if (loadingResources) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const monthName = calendarMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Service Selection */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-bold mr-3">
              1
            </span>
            Select Service
          </h3>

          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
          >
            <option value="">Choose a service...</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} ({service.duration} min)
              </option>
            ))}
          </select>
          {selectedService && (
            <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Duration:</strong> {selectedService.duration} minutes
              {selectedService.description && ` — ${selectedService.description}`}
            </p>
          )}
        </div>

        {/* Step 2: Staff Selection */}
        {formData.service && (
          <div className="border-l-4 border-purple-500 pl-4 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-bold mr-3">
                2
              </span>
              Select Staff Member
            </h3>

            {loadingDates ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
                <span className="text-gray-600">Loading available staff...</span>
              </div>
            ) : (
              <select
                id="assignedStaff"
                name="assignedStaff"
                value={formData.assignedStaff}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
              >
                <option value="">Choose a staff member...</option>
                {staff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                    {member.specialization && ` — ${member.specialization}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Step 3: Date Selection with Calendar */}
        {formData.service && formData.assignedStaff && (
          <div className="border-l-4 border-green-500 pl-4 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white text-sm font-bold mr-3">
                3
              </span>
              Select Date
            </h3>

            {loadingDates ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
              </div>
            ) : availableDates.length > 0 ? (
              <>
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h4 className="text-lg font-bold text-gray-900">{monthName}</h4>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-bold text-gray-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square"></div>;
                      }

                      const dateString = date.toISOString().split("T")[0];
                      const isAvailable = isDateAvailable(dateString);
                      const isSelected = formData.date === dateString;
                      const isPast = date < new Date(today);

                      return (
                        <button
                          key={dateString}
                          type="button"
                          disabled={!isAvailable || isPast}
                          onClick={() => isAvailable && !isPast && handleDateSelect(dateString)}
                          title={!isAvailable ? getUnavailableDateReason(dateString) || "Not available" : ""}
                          className={`
                            aspect-square rounded-lg font-semibold text-sm transition-all relative
                            ${isSelected
                              ? "bg-green-500 text-white ring-2 ring-green-300 ring-offset-2 shadow-lg"
                              : isAvailable && !isPast
                              ? "bg-white border-2 border-green-300 text-gray-900 hover:bg-green-50 hover:border-green-500 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }
                          `}
                        >
                          <span>{date.getDate()}</span>
                          {isAvailable && !isPast && (
                            <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-700">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-green-300 rounded"></div>
                      <span className="text-gray-700">Open</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-100 rounded"></div>
                      <span className="text-gray-500">Unavailable</span>
                    </div>
                  </div>
                </div>

                {formData.date && getUnavailableDateReason(formData.date) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      <strong>Why unavailable:</strong> {getUnavailableDateReason(formData.date)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
                <svg className="w-12 h-12 text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-amber-900 font-medium mb-1">No available dates</p>
                <p className="text-sm text-amber-700">
                  This staff member has no availability for this service in the next 60 days. Try selecting a different staff member.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Time Slot Selection */}
        {formData.service && formData.date && (
          <div className="border-l-4 border-orange-500 pl-4 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white text-sm font-bold mr-3">
                4
              </span>
              Select Time Slot
            </h3>

            {checkingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
                <span className="text-gray-600">Loading available times...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.startTime === slot.startTime
                        ? "bg-orange-500 text-white ring-2 ring-orange-300 ring-offset-2 shadow-lg"
                        : "bg-white border-2 border-orange-200 text-gray-900 hover:bg-orange-50 hover:border-orange-400"
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-900 font-medium mb-1">No available time slots</p>
                <p className="text-sm text-amber-700">
                  All time slots are booked for this date. Please select a different date or staff member.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Room Selection (Optional) */}
        {formData.service && (
          <div>
            <label htmlFor="room" className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Room <span className="text-gray-400">(Optional)</span>
            </label>
            <select
              id="room"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              <option value="">Any available room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name}
                  {room.location && ` — ${room.location}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        {formData.service && formData.date && (
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special requests or notes..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            ></textarea>
          </div>
        )}

        {/* Form Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || !formData.service || !formData.date || !formData.startTime || !formData.assignedStaff}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Booking...
                </span>
              ) : (
                "Complete Booking"
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
            >
              Reset
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Booking Progress */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Step Progress:</strong>{" "}
            {formData.service ? "✓ Service" : "Service"} →{" "}
            {formData.assignedStaff ? "✓ Staff" : "Staff"} →{" "}
            {formData.date ? "✓ Date" : "Date"} →{" "}
            {formData.startTime ? "✓ Time" : "Time"}
          </p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
