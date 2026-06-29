import React, { useState } from "react";
import { cn } from "../../lib/utils"; // using relative path for alias if alias isn't set up

export function FaqAccordion({
  data,
  className,
  questionClassName,
  answerClassName,
  timestamp,
}) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={cn("w-full mx-auto space-y-4", className)}>
      {timestamp && (
        <div className="text-center text-xs text-slate-500 mb-4">
          {timestamp}
        </div>
      )}
      {data.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div key={item.id} className="flex flex-col gap-2">
            {/* Question (User-like message) */}
            <div className="flex justify-end w-full">
              <button
                onClick={() => toggle(item.id)}
                className={cn(
                  "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 text-left transition-all duration-200",
                  "bg-blue-600 text-white hover:bg-blue-700",
                  "rounded-br-sm",
                  questionClassName
                )}
              >
                <div className="flex items-center gap-2">
                  {item.iconPosition === "left" && item.icon && (
                    <span>{item.icon}</span>
                  )}
                  <span className="font-medium text-sm sm:text-base leading-relaxed">
                    {item.question}
                  </span>
                  {item.iconPosition === "right" && item.icon && (
                    <span>{item.icon}</span>
                  )}
                </div>
              </button>
            </div>

            {/* Answer (Bot-like message) */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="flex justify-start w-full pt-1 pb-2">
                  <div
                    className={cn(
                      "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4",
                      "bg-gray-100 text-gray-800",
                      "rounded-bl-sm",
                      answerClassName
                    )}
                  >
                    <p className="text-sm sm:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
