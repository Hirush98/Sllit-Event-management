import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import eventService from "../services/eventService";

const FeedbackListPage = () => {
  const { eventId } = useParams();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log('feedbacks', feedbacks);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await eventService.getEventFeedback(eventId);
        setFeedbacks(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [eventId]);

  // ⭐ calculate average rating
  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, f) => acc + f.rating, 0) /
          feedbacks.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white shadow sm:rounded-lg mb-6 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Event Feedback
          </h2>
          <p className="text-sm text-gray-500">
            Total Responses: {feedbacks.length}
          </p>

          <div className="mt-2 text-yellow-500 text-lg">
            ⭐ {avgRating} / 5
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow sm:rounded-lg">
          {loading ? (
            <p className="p-4 text-gray-500">Loading feedback...</p>
          ) : error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : feedbacks.length === 0 ? (
            <p className="p-4 text-gray-500">No feedback yet</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {feedbacks.map((fb) => (
                <li key={fb._id} className="p-5">

                  {/* Rating + Date */}
                  <div className="flex justify-between items-center">
                    <div className="text-yellow-400 text-lg">
                      {"★".repeat(fb.rating)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - fb.rating)}
                      </span>
                    </div>

                    <span className="text-xs text-gray-400">
                      {new Date(fb.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* User (if populated) */}
                  {fb.userId && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fb.userId.name} • {fb.userId.studentId}
                    </p>
                  )}

                  {/* Comment */}
                  <p className="mt-2 text-sm text-gray-800">
                    {fb.comments || "No comment provided"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackListPage;