import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import EventRegistrationForm from '../components/events/EventRegistrationForm';
import EventAnnouncements from '../components/events/EventAnnouncements';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  // Organizer state
  const [feedbackQr, setFeedbackQr] = useState(null);
  const [qrError, setQrError] = useState(null);

  // Check if user is an organizer or admin
  const isOrganizerOrAdmin = user && (user.role === 'organizer' || user.role === 'admin');
  // Check if user is the event creator
  const isEventCreator = event && user && event.createdBy === user._id;
  // Check if user is a participant (not admin or organizer)
  // eslint-disable-next-line no-unused-vars
  const isParticipant = user && user.role === 'participant';

  console.log('EventDetailPage rendered with eventId:', eventId);

  // Function to fetch event details
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate eventId before making API call
      if (!eventId) {
        setError('Invalid event ID');
        setLoading(false);
        return;
      }

      // console.log('Fetching event with ID:', eventId); // Debug log

      const eventData = await eventService.getEventById(eventId);
      // console.log('Event data received:', eventData); // Debug log to see what's returned
      setEvent(eventData);

      // Fetch participants in a separate call to avoid race conditions
      await fetchParticipants();

    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch participants
  const fetchParticipants = async () => {
    if (!user || !eventId) return;

    try {
      const participantsData = await eventService.getEventParticipants(eventId);
      // console.log('Participants data received:', participantsData); // Debug log

      // Ensure we have an array of participants
      const list = Array.isArray(participantsData) ? participantsData :
        (participantsData && participantsData.data ? participantsData.data : []);

      setParticipants(list);
      setIsRegistered(list.some(p => p.userId === user.id));
    } catch (participantError) {
      console.warn('Failed to fetch participants:', participantError);
      setParticipants([]);
    }
  };

  // Function to generate QR
  const generateFeedbackQr = async () => {
    try {
      setQrError(null);      // Reset previous error before trying
      setFeedbackQr(null);   // Reset previous QR

      const res = await eventService.generateFeedbackQr(eventId);
      // Backend returns { url, qrCode }
      setFeedbackQr(res);  // store the entire object: { qrCode, url }
    } catch (err) {
      console.error('Failed to generate QR:', err);
      setQrError(err.message || 'Failed to generate QR code. Try again.');
    }
  };

  useEffect(() => {
    // Only fetch if eventId exists
    if (eventId) {
      fetchEventDetails();
    } else {
      setError('No event ID provided');
      setLoading(false);
    }

    // Set up polling to refresh participant data every 10 seconds
    const participantPolling = setInterval(() => {
      if (eventId && user) {
        fetchParticipants();
      }
    }, 10000); // 10 seconds

    // Clean up interval on component unmount
    return () => clearInterval(participantPolling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]);

  const handleRegister = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }

    // Only allow participants to register
    if (user.role === 'admin' || user.role === 'organizer') {
      // console.log('Admins and organizers cannot register for events');
      return;
    }

    setShowRegistrationForm(true);
  };

  const handleCancelRegistration = async () => {
    try {
      await eventService.cancelRegistration(eventId);
      setIsRegistered(false);
      // Fetch updated participants list after cancellation
      fetchParticipants();
    } catch (err) {
      console.error('Failed to cancel registration:', err);
      // Show error message
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await eventService.deleteEvent(eventId);
        navigate('/events');
      } catch (err) {
        console.error('Failed to delete event:', err);
        // Show error message
      }
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return 'Invalid Date';
    const options = {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  // Show error if no eventId
  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-center text-gray-800">Invalid Event ID</h2>
          <p className="mt-2 text-center text-gray-600">The event ID is missing or invalid.</p>
          <div className="mt-6 text-center">
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-center text-gray-800">{error}</h2>
          <div className="mt-6 text-center">
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800">Event not found</h2>
          <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event details card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900">
                {event?.title || 'Event Title'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Organized by{" "}
                {event?.organizerName &&
                  event.organizerName.trim() !== "undefined undefined"
                  ? event.organizerName
                  : "Event Organizer"}
              </p>
            </div>
            {/* Admin/Organizer actions */}
            <div className="flex space-x-3">
              {isEventCreator && (
                <>
                  <Link
                    to={`/events/${eventId}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </>
              )}
              <Link
                to={`/leaderboard/${eventId}`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Date and Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event?.date ? formatDate(event.date) : 'Date not specified'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event?.location || 'Location not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {event?.description || 'No description provided'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {participants && event ? `${participants.length} / ${event.capacity || 0} registered` : 'Loading capacity information...'}
                </dd>
              </div>
              {/* Removing duplicate Description section */}
              {event?.tags && event.tags.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {isEventCreator && (
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Feedback QR
                </h3>
                <p className="text-sm text-gray-500">
                  Generate and share feedback link with participants
                </p>
              </div>

              <button
                onClick={generateFeedbackQr}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Generate QR
              </button>
            </div>

            {feedbackQr && (
              <div className="border-t border-gray-200 px-6 py-6 grid md:grid-cols-2 gap-6 items-center">

                {/* QR Image */}
                <div className="flex flex-col items-center">
                  <img
                    src={feedbackQr.qrCode}
                    alt="Feedback QR"
                    className="w-52 h-52 border rounded-lg shadow-sm"
                  />

                  {/* Download Button */}
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = feedbackQr.qrCode;
                      link.download = "feedback-qr.png";
                      link.click();
                    }}
                    className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Download QR
                  </button>
                </div>

                {/* Link + Actions */}
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Share this link:
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feedbackQr.url}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md text-sm text-gray-700 bg-gray-50"
                    />

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(feedbackQr.url);
                        alert("Link copied!");
                      }}
                      className="px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900"
                    >
                      Copy
                    </button>
                  </div>

                  {/* Open link */}
                  <a
                    href={feedbackQr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-indigo-600 hover:underline"
                  >
                    Open Feedback Form →
                  </a>
                </div>
              </div>
            )}

            {qrError && (
              <div className="px-6 pb-4 text-sm text-red-500">
                {qrError}
              </div>
            )}
          </div>
        )}

        {isEventCreator && (
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Event Feedback
                </h3>
                <p className="text-sm text-gray-500">
                  View all participant feedback and ratings
                </p>
              </div>

              <button
                onClick={() => navigate(`/events/${eventId}/feedbacks`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Feedback
              </button>

            </div>
          </div>
        )}

        {/* Registration section - only visible to participants */}
        {!isOrganizerOrAdmin && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Event Registration
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  {isRegistered
                    ? "You are registered for this event."
                    : participants && event && participants.length >= (event.capacity || 0)
                      ? "This event has reached its capacity."
                      : "Register to secure your spot for this event."}
                </p>
              </div>
              <div className="mt-5">
                {isRegistered ? (
                  <button
                    onClick={handleCancelRegistration}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={participants && event && participants.length >= (event.capacity || 0)}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${participants && event && participants.length >= (event.capacity || 0)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      }`}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Registration form modal */}
        {showRegistrationForm && (
          <EventRegistrationForm
            event={event}
            onClose={() => setShowRegistrationForm(false)}
            onSuccess={() => {
              setIsRegistered(true);
              setShowRegistrationForm(false);
              // Fetch updated participants list after successful registration
              fetchParticipants();
            }}
          />
        )}

        {/* Participants section (visible to organizers/admins) */}
        {isOrganizerOrAdmin && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Registered Participants ({participants ? participants.length : 0})
              </h3>
              <div className="mt-4">
                {participants && participants.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <li key={participant.userId || `participant-${Math.random()}`} className="py-4 flex">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {participant.name || 'Unnamed Participant'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {participant.email || 'No email provided'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No participants registered yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Announcements Section */}
        <div className="mt-8">
          <EventAnnouncements eventId={eventId} eventTitle={event?.title} />
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;