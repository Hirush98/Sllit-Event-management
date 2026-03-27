import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import eventService from "../services/eventService";
import authService from "../services/authService";

const FeedbackListPage = () => {
    const { eventId } = useParams();

    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [userCache, setUserCache] = useState({});

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await eventService.getEventFeedback(eventId);
                setFeedbacks(res.data);
            } catch (err) {
                setError(err.message || "Failed to load feedbacks");
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [eventId]);

    const avgRating =
        feedbacks.length > 0
            ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

    const handleViewDetails = async (feedback) => {
        const userId = feedback.userId.toString();
        setModalData({ feedback, user: userCache[userId] || null });
        setModalLoading(!userCache[userId]);

        try {
            if (!userCache[userId]) {
                const res = await authService.getUserById(userId);
                setUserCache((prev) => ({ ...prev, [userId]: res.user }));
                setModalData({ feedback, user: res.user });
            }
        } catch (err) {
            console.error("Failed to fetch user data", err);
            setModalData({
                feedback,
                user: { name: "Unknown", email: "-", studentId: "-" },
            });
            alert("Failed to fetch user data");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-4">
                    {/* Header */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Feedback Summary</h1>

                    {/* Total Responses & Average Rating */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <p className="text-gray-600 text-sm md:text-base">
                            Total Responses: <span className="font-semibold text-gray-800">{feedbacks.length}</span>
                        </p>
                        <div className="flex items-center text-yellow-500 text-lg md:text-xl font-semibold">
                            ⭐ {avgRating} / 5
                        </div>
                    </div>

                    {/* Star Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div className="bg-yellow-50 rounded-xl py-2 px-3 flex flex-col items-center">
                            <span className="text-yellow-500 font-bold">5⭐</span>
                            <span className="text-gray-700 text-sm">12</span>
                        </div>
                        <div className="bg-yellow-50 rounded-xl py-2 px-3 flex flex-col items-center">
                            <span className="text-yellow-500 font-bold">4⭐</span>
                            <span className="text-gray-700 text-sm">8</span>
                        </div>
                        <div className="bg-yellow-50 rounded-xl py-2 px-3 flex flex-col items-center">
                            <span className="text-yellow-500 font-bold">3⭐</span>
                            <span className="text-gray-700 text-sm">3</span>
                        </div>
                        <div className="bg-yellow-50 rounded-xl py-2 px-3 flex flex-col items-center">
                            <span className="text-yellow-500 font-bold">2⭐</span>
                            <span className="text-gray-700 text-sm">1</span>
                        </div>
                        <div className="bg-yellow-50 rounded-xl py-2 px-3 flex flex-col items-center">
                            <span className="text-yellow-500 font-bold">1⭐</span>
                            <span className="text-gray-700 text-sm">0</span>
                        </div>
                    </div>

                    {/* Quick Summary */}
                    <p className="text-gray-600 text-sm md:text-base italic border-t border-gray-200 pt-3">
                        Overall, attendees found the event engaging with mostly positive feedback. Most people appreciated the organization and content quality.
                    </p>
                </div>

                {/* Feedback List */}
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-gray-500 text-center text-sm">Loading feedback...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center text-sm">{error}</p>
                    ) : feedbacks.length === 0 ? (
                        <p className="text-gray-500 text-center text-sm">No feedback yet</p>
                    ) : (
                        feedbacks.map((fb) => (
                            <div
                                key={fb._id}
                                className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row justify-between items-start hover:shadow-md transition"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="text-yellow-400 text-base">
                                            {"★".repeat(fb.rating)}
                                            <span className="text-gray-300 ml-1">{"★".repeat(5 - fb.rating)}</span>
                                        </div>
                                        <span className="text-gray-400 text-xs">
                                            {new Date(fb.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mt-1 text-sm">
                                        User ID: <span className="font-medium">{fb.userId.toString().slice(-6)}</span>
                                    </p>

                                    <p className="text-gray-800 mt-1 text-sm break-words">
                                        {fb.comments
                                            ? fb.comments.length > 35
                                                ? fb.comments.substring(0, 35) + "..."
                                                : fb.comments
                                            : "No comment provided"}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleViewDetails(fb)}
                                    className="mt-3 md:mt-0 md:ml-4 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal */}
                {modalData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
                        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 transform transition-transform duration-200 scale-95 md:scale-100 overflow-hidden">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 truncate max-w-[80%]">
                                    User & Feedback Details
                                </h3>
                                <button
                                    onClick={() => setModalData(null)}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {modalLoading ? (
                                <p className="text-gray-500 text-center text-sm">Loading user data...</p>
                            ) : (
                                <div className="space-y-4">
                                    {/* User Info Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium">Student ID</p>
                                            <p className="text-gray-900 text-sm font-semibold truncate">{modalData.user?.studentId}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium">Email</p>
                                            <p className="text-gray-900 text-sm break-all">{modalData.user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium">Name</p>
                                            <p className="text-gray-900 text-sm font-semibold truncate">{modalData.user?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium">Mobile No</p>
                                            <p className="text-gray-900 text-sm font-semibold truncate">{modalData.user?.mobileNo}</p>
                                        </div>
                                    </div>

                                    {/* Feedback Section */}
                                    <div className="border-t border-gray-200 pt-3">
                                        <p className="text-gray-500 text-xs font-medium mb-1">Comment</p>
                                        <p className="text-gray-900 text-sm break-words">{modalData.feedback.comments || "No comment provided"}</p>

                                        <div className="mt-2 flex items-center">
                                            <p className="text-gray-500 text-xs font-medium mr-2">Rating:</p>
                                            <div className="flex text-yellow-400 text-lg">
                                                {"★".repeat(modalData.feedback.rating)}
                                                <span className="text-gray-300 ml-1">{"★".repeat(5 - modalData.feedback.rating)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => setModalData(null)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackListPage;