import React from "react";
import Card from "../atoms/Card";

function PostLoadingCard({ className = "" }) {
  return (
    <Card className={`w-full animate-pulse p-4 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 skeleton"></div>
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 skeleton"></div>
          <div className="w-16 h-3 skeleton"></div>
        </div>
      </div>

      <div className="w-full h-16 skeleton"></div>

      <div className="w-full h-40 skeleton"></div>

      <div className="flex justify-between items-center">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="w-10 h-6 skeleton"></div>
        ))}
      </div>
    </Card>
  );
}

const PostLoading = () => <PostLoadingCard className="h-[70%]" />;

const FeedLoading = () => (
  <>
    {[...Array(5)].map((_, index) => (
      <PostLoadingCard key={index} />
    ))}
  </>
);

export { PostLoading, PostLoadingCard, FeedLoading };