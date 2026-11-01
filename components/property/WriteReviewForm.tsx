"use client";
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  propertyId?: string;
  jobId?: string;
}

export function WriteReviewForm({ propertyId, jobId }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating");
    if (comment.length < 10) return toast.error("Comment must be at least 10 characters");

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, jobId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message ?? "Review submitted!");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit review");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl p-5 text-center mt-4"
        style={{ background: "var(--success-light)", border: "1px solid var(--success)" }}>
        <p className="text-2xl mb-2">🙏</p>
        <p className="font-semibold text-sm" style={{ color: "var(--success)" }}>
          Review submitted! It will appear after admin approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl p-5"
      style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
      <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Write a Review / समीक्षा लिखें
      </h3>

      {/* Star rating */}
      <div className="mb-4">
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className="w-7 h-7"
                style={{
                  color: "#F59E0B",
                  fill: i <= (hovered || rating) ? "#F59E0B" : "transparent",
                }}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          Your Review (min 10 characters)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--text-primary)",
          }}
          onFocus={e => (e.target.style.borderColor = "var(--primary)")}
          onBlur={e => (e.target.style.borderColor = "var(--border)")}
        />
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {comment.length}/500 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}
