"use client";
import { Star, MapPin } from "lucide-react";

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  commentHi?: string | null;
  createdAt: Date;
}

interface Props {
  reviews: Review[];
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${starSize} ${i <= rating ? "fill-current" : "opacity-20"}`}
          style={{ color: "var(--brand-gold, #F59E0B)" }}
        />
      ))}
    </div>
  );
}

export function PropertyReviews({ reviews }: Props) {
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Reviews{reviews.length > 0 && (
          <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>
            ({reviews.length}) · लोगों की राय
          </span>
        )}
      </h2>

      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: "var(--surface-alt)" }}>
          <div className="text-4xl font-black" style={{ color: "var(--primary)" }}>
            {avgRating.toFixed(1)}
          </div>
          <div>
            <StarRating rating={Math.round(avgRating)} size="md" />
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 rounded-xl" style={{ background: "var(--surface-alt)" }}>
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card-warm rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--primary)" }}
                  >
                    {review.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{review.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <MapPin className="w-3 h-3" /> {review.location}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                "{review.comment}"
              </p>
              {review.commentHi && (
                <p className="text-xs mt-1 italic" style={{ color: "var(--text-tertiary)" }}>
                  "{review.commentHi}"
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                {new Date(review.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs mt-4 text-center" style={{ color: "var(--text-muted)" }}>
        Reviews are verified and approved by our team before publishing.
      </p>
    </section>
  );
}
