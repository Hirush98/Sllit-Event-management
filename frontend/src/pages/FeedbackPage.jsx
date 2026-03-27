import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import eventService from "../services/eventService";
import { useAuth } from "../context";

const FeedbackPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(null);
  const [comments, setComments] = useState("");
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 👉 word count logic
  const wordCount = comments.trim() === ""
    ? 0
    : comments.trim().split(/\s+/).length;

  const maxWords = 100;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventService.getEventById(eventId);
        setEvent(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleCommentChange = (e) => {
    const value = e.target.value;

    const words = value.trim().split(/\s+/);

    // 🚫 prevent more than 100 words
    if (words.length <= maxWords) {
      setComments(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (wordCount > maxWords) {
      setError("Comments cannot exceed 100 words.");
      return;
    }

    setLoading(true);

    try {
      await eventService.submitFeedback(eventId, { rating, comments });

      setSuccess("🎉 Thank you! Your feedback has been submitted.");
      setTimeout(() => navigate("/home"), 2000);

    } catch (err) {
      if (err.message.includes("already")) {
        setError("⚠️ You have already submitted feedback for this event.");
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading event...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: `url('/uni.jpeg')`, 
      }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl text-white border border-white/20">
        
        {/* Event */}
        <h2 className="text-2xl font-bold mb-1">{event.title}</h2>
        <p className="text-sm text-gray-300 mb-4">Event Feedback</p>

        {/* User Info */}
        <div className="bg-white/10 p-4 rounded-lg mb-4 border border-white/10">
          <p className="text-sm"><strong>Name:</strong> {user?.name}</p>
          <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
          <p className="text-sm"><strong>Student ID:</strong> {user?.studentId}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-400 text-green-200 p-2 rounded mb-3 text-sm">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            
            {/* ⭐ Rating */}
            <div className="mb-4">
              <p className="mb-2 text-sm">Rating</p>
              <div className="flex space-x-2 text-3xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(null)}
                    className={`transition ${
                      (hover || rating) >= star
                        ? "text-yellow-400 scale-110"
                        : "text-gray-400"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* 💬 Comments */}
            <div className="mb-4">
              <label className="text-sm block mb-1">Comments</label>
              <textarea
                value={comments}
                onChange={handleCommentChange}
                rows={4}
                placeholder="Share your experience..."
                className="w-full p-3 rounded bg-white/20 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              {/* 👉 word counter */}
              <div className="flex justify-between text-xs mt-1">
                <span className={wordCount > maxWords ? "text-red-400" : "text-gray-300"}>
                  {wordCount}/{maxWords} words
                </span>
                {wordCount > maxWords && (
                  <span className="text-red-400">Too many words</span>
                )}
              </div>
            </div>

            {/* 🚀 Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 transition p-2 rounded font-semibold shadow-lg"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;