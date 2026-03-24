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

  // Check available slots when service, date, and staff/room are selected
  useEffect(() => {
    const checkAvailableSlots = async () => {
      // Need service, date, and either staff or room to check availability
      if (!formData.service || !formData.date) {
        setAvailableSlots([]);
        return;
      }

      if (!formData.assignedStaff && !formData.room) {
        setAvailableSlots([]);
        return;
      }

      try {
        setCheckingSlots(true);
        const params = {
          date: formData.date,
          serviceId: formData.service,
        };

        if (formData.assignedStaff) params.staffId = formData.assignedStaff;
        if (formData.room) params.roomId = formData.room;

        const response = await api.get("/bookings/available-slots", { params });
        setAvailableSlots(response.data.slots || []);
      } catch (err) {
        console.error("Error checking available slots:", err);
        setAvailableSlots([]);
      } finally {
        setCheckingSlots(false);
      }
    };

    checkAvailableSlots();
  }, [formData.service, formData.date, formData.assignedStaff, formData.room]);

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

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.service || !formData.date || !formData.startTime || !formData.endTime) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      };

      // Add optional fields only if selected
      if (formData.assignedStaff) {
        bookingData.assignedStaff = formData.assignedStaff;
      }
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

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Service Selection */}
        <div>
          <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-2">
            Service <span className="text-red-500">*</span>
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} ({service.duration} min)
              </option>
            ))}
          </select>
          {selectedService && (
            <p className="mt-2 text-sm text-gray-600">
              Duration: {selectedService.duration} minutes
              {selectedService.description && ` - ${selectedService.description}`}
            </p>
          )}
        </div>

        {/* Staff Selection (Optional) */}
        <div>
          <label htmlFor="assignedStaff" className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Staff Member <span className="text-gray-400">(Optional)</span>
          </label>
          <select
            id="assignedStaff"
            name="assignedStaff"
            value={formData.assignedStaff}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
          >
            <option value="">Any available staff</option>
            {staff.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
                {member.specialization && ` - ${member.specialization}`}
              </option>
            ))}
          </select>
        </div>

        {/* Room Selection (Optional) */}
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
                {room.location && ` - ${room.location}`}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Available Slots Display */}
        {formData.service && formData.date && (formData.assignedStaff || formData.room) && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Available Time Slots
            </label>
            {checkingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.startTime === slot.startTime
                        ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 font-medium">No available slots for this selection</p>
                <p className="text-sm text-amber-600 mt-1">
                  Try selecting a different date, staff member, or room
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manual Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Notes <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Any special requests or notes..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          ></textarea>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
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
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Booking...
              </span>
            ) : (
              "Book Appointment"
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
          >
            Reset
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Select a service and date first, then choose staff or room to see
            available time slots. You can also manually enter custom times.
          </p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
