"use client";
import Image from "next/image";
import React from "react";

const AuthRightSide = React.memo(function AuthRightSide({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative h-screen overflow-hidden bg-gradient-to-br from-default-50 border-l border-default-200/50 via-default-50 to-default-100 ${className}`}
    >
      {/* Modern Gradient Mesh Testimonial Card */}
      <div className="absolute bottom-8 right-8 max-w-md">
        <div className="relative group">
          {/* Main card with gradient mesh background */}
          <div className="relative overflow-hidden rounded-2xl border border-default-200/80 drop-shadow-xs">
            {/* Glass overlay with default colors */}
            <div className="relative backdrop-blur-xl bg-default-50/60 p-6">
              {/* Quote icon */}
              <svg
                className="absolute top-4 right-4 h-8 w-8 text-default-400/30"
                fill="currentColor"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <title>Quote icon</title>
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
                    alt="Customer"
                    className="h-14 w-14 rounded-full object-cover"
                    width={56}
                    height={56}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-default-700 leading-relaxed mb-4 font-medium">
                    &quot;LeadNova revolutionized our lead management workflow.
                    The seamless Meta integration and real-time updates saved us
                    10+ hours weekly.&quot;
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-default-800">
                        Alex Mitchell
                      </p>
                      <p className="text-xs text-default-500 font-medium">
                        Growth Manager, Helio
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={`rating-star-${index + 1}`}
                          className="h-4 w-4 fill-default-500 drop-shadow-sm"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AuthRightSide;
