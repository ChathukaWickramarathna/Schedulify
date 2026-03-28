import { useState } from "react";
import api from "../api/axios";
import { format, parseISO } from "date-fns";

const BookingTable = ({ bookings, onBookingUpdate, showUserInfo = false }) => {
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (err) {
      return dateString;
    }
  };

  // Format time for display (e.g., "09:00" -> "9:00 AM")
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
        label: "Pending",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        label: "Rejected",
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  // Check if booking can be cancelled
  const canCancel = (booking) => {
    // Can cancel if status is pending or approved (not already cancelled or rejected)
    return booking.status === "pending" || booking.status === "approved";
  };

  // Check if booking can be edited (only pending bookings)
  const canEdit = (booking) => {
    return booking.status === "pending";
  };

  // Open edit modal
  const openEditModal = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      date: format(parseISO(booking.date), "yyyy-MM-dd"),
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes || "",
    });
    setShowEditModal(true);
  };

  // Handle edit booking
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      await api.put(`/bookings/${selectedBooking._id}`, editForm);
      setSuccess("Booking updated successfully");
      setShowEditModal(false);

      // Notify parent component to refresh bookings
      if (onBookingUpdate) {
        onBookingUpdate();
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update booking");
    }
  };

  // Handle cancel booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");

      await api.patch(`/bookings/${bookingId}/cancel`);

      // Notify parent component to refresh bookings
      if (onBookingUpdate) {
        onBookingUpdate();
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="flex flex-col items-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-600">You don't have any bookings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Service
                </th>
                {showUserInfo && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {booking.service?.name || "N/A"}
                    </div>
                    {booking.service?.duration && (
                      <div className="text-xs text-gray-500">
                        {booking.service.duration} min
                      </div>
                    )}
                  </td>
                  {showUserInfo && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.user?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.user?.email || ""}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{formatTime(booking.startTime)}</div>
                    <div className="text-xs text-gray-500">
                      to {formatTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {booking.assignedStaff?.name || (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {booking.room?.name || (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {canEdit(booking) && (
                      <button
                        onClick={() => openEditModal(booking)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {canCancel(booking) && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancellingId === booking._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">
                  {booking.service?.name || "N/A"}
                </h3>
                {getStatusBadge(booking.status)}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              {/* User Info (if shown) */}
              {showUserInfo && booking.user && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                    User:
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {booking.user.name}
                    </p>
                    <p className="text-xs text-gray-500">{booking.user.email}</p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                  Date:
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {formatDate(booking.date)}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                  Time:
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </div>
              </div>

              {/* Duration */}
              {booking.service?.duration && (
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                    Duration:
                  </div>
                  <div className="flex-1 text-sm text-gray-900">
                    {booking.service.duration} minutes
                  </div>
                </div>
              )}

              {/* Staff */}
              <div className="flex items-center">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                  Staff:
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {booking.assignedStaff?.name || (
                    <span className="text-gray-400 italic">Not assigned</span>
                  )}
                </div>
              </div>

              {/* Room */}
              <div className="flex items-center">
                <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                  Room:
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {booking.room?.name || (
                    <span className="text-gray-400 italic">Not assigned</span>
                  )}
                  {booking.room?.location && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({booking.room.location})
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-gray-600">
                    Notes:
                  </div>
                  <div className="flex-1 text-sm text-gray-700 italic">
                    {booking.notes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {(canEdit(booking) || canCancel(booking)) && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  {canEdit(booking) && (
                    <button
                      onClick={() => openEditModal(booking)}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit Booking
                    </button>
                  )}
                  {canCancel(booking) && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Edit Booking</h3>
              <p className="text-sm text-blue-100 mt-1">
                {selectedBooking.service?.name}
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editForm.startTime}
                      onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={editForm.endTime}
                      onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes or special requests..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can only edit pending bookings. After approval, please
                  contact staff for any changes.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
