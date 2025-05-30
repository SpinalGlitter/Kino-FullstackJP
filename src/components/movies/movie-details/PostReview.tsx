"use client";
import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const PostReview = ({ movie }: { movie: { slug: string } }) => {
  const { status } = useSession();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState("");
  const [userName, setUserName] = useState("");
  const [feedback, setFeedback] = useState<null | {
    message: string;
    type: "success" | "error";
  }>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleClick = async () => {
    if (!comment || !rating || !userName) {
      setFeedback({ message: "Please fill in all fields.", type: "error" });
      return;
    }

    setIsSubmitting(true);

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setFeedback({
        message: "Rating must be between 1 and 5.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`/api/movies/${movie.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: movie.slug,
          userName,
          rating: ratingNum,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setFeedback({ message: "Thank's for your review!", type: "success" });
      setComment("");
      setRating("");
      setUserName("");
    } catch (err) {
      console.error("Submission error:", err);
      setFeedback({
        message: err instanceof Error ? err.message : "Failed to submit review",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="text-center p-4 bg-kino-darkgrey rounded-lg my-4 mx-2 max-w-xs">
        <p className="text-kino-white mb-2 font-bold">
          Log in to post a review!
        </p>
        <p className="text-kino-white mb-2">
          And enjoy all our exclusive member benefits!
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="grid grid-cols-2 grid-rows-5 gap-4 p-4 bg-kino-darkgrey rounded-lg my-4 mx-2 max-w-xs">
        <h2 className="font-bold col-span-2 text-center">Submit a review</h2>
        <textarea
          placeholder="Write review"
          aria-label="Write your review here"
          className="col-span-2 row-span-3 border border-kino-red rounded-lg text-xs p-2 mb-2 w-full resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="border border-kino-red rounded-lg p-2 mb-2">
          <label htmlFor="rating" className="text-sm text-kino-grey"></label>
          <select
            id="rating"
            className="bg-kino-darkgrey text-kino-white text-xs"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            aria-describedby="rating-help"
          >
            <option value="">Choose rating</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <p id="rating-help" className="sr-only">
            Select a rating from 1 to 5
          </p>
        </div>
        <input
          type="text"
          placeholder="Name"
          aria-label="Enter your name"
          className="border border-kino-red text-xs rounded-lg p-2 mb-2"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        {feedback && (
          <div
            className={`mb-2 text-xs text-center ${
              feedback.type === "success" ? "text-lime-500" : "text-kino-red"
            }`}
            role="alert"
          >
            {feedback.message}
          </div>
        )}
        <Button
          type="submit"
          aria-label="Submit your review"
          className="row-start-6 col-start-2 bg-kino-red text-xs hover:bg-kino-darkred text-kino-white py-2 px-4"
          onClick={handleClick}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default PostReview;
