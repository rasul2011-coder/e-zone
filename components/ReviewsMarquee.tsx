'use client';

import { useEffect, useRef } from 'react';

interface Review {
  name: string;
  course: string;
  text: string;
  rating: number;
}

interface ReviewsMarqueeProps {
  reviews: Review[];
  rows?: number; // Количество рядов (по умолчанию 1)
}

export default function ReviewsMarquee({ reviews, rows = 1 }: ReviewsMarqueeProps) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const positions: number[] = [];
    let animationId: number;
    const speed = 0.4;

    // Initialize positions - rows moving right start from negative offset
    rowRefs.current.forEach((row, index) => {
      if (!row) return;
      const direction = index % 2 === 0 ? -1 : 1;
      // If moving right, start from far left so content is visible
      positions[index] = direction === 1 ? -(row.scrollWidth / 12) : 0;
    });

    const animate = () => {
      rowRefs.current.forEach((row, index) => {
        if (!row) return;

        // Чередование направлений: нечетные влево, четные вправо
        const direction = index % 2 === 0 ? -1 : 1;
        
        positions[index] += speed * direction;

        // Reset position for seamless loop (12x duplicates)
        const resetThreshold = row.scrollWidth / 12;
        
        if (direction === -1) {
          // Moving left
          if (Math.abs(positions[index]) >= resetThreshold) {
            positions[index] = 0;
          }
        } else {
          // Moving right
          if (positions[index] >= 0) {
            positions[index] = -resetThreshold;
          }
        }

        row.style.transform = `translateX(${positions[index]}px)`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const pauseHandlers: Array<{ el: HTMLDivElement; pause: () => void; resume: () => void }> = [];
    
    rowRefs.current.forEach((row) => {
      if (!row) return;
      
      const pauseAnimation = () => cancelAnimationFrame(animationId);
      const resumeAnimation = () => {
        animationId = requestAnimationFrame(animate);
      };

      row.addEventListener('mouseenter', pauseAnimation);
      row.addEventListener('mouseleave', resumeAnimation);
      
      pauseHandlers.push({ el: row, pause: pauseAnimation, resume: resumeAnimation });
    });

    return () => {
      cancelAnimationFrame(animationId);
      pauseHandlers.forEach(({ el, pause, resume }) => {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resume);
      });
    };
  }, [rows]);

  // All rows show ALL reviews in order
  const rowsData: Review[][] = Array(rows).fill(reviews);

  return (
    <div className="space-y-6 overflow-hidden py-8">
      {rowsData.map((rowReviews, rowIndex) => (
        <div key={rowIndex} className="relative overflow-hidden py-2">
          <div
            ref={(el) => {
              rowRefs.current[rowIndex] = el;
            }}
            className="flex gap-4 will-change-transform"
            style={{ width: 'max-content' }}
          >
            {/* 12x duplicate for seamless infinite loop */}
            {Array(12).fill(rowReviews).flat().map((review, idx) => (
              <ReviewCard key={`${rowIndex}-${idx}`} review={review} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg hover:shadow-2xl hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      style={{
        minWidth: 'clamp(220px, 60vw, 300px)',
        maxWidth: 'clamp(220px, 60vw, 300px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top row: stars + course tag */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex gap-0.5">
          {Array.from({ length: review.rating }).map((_, s) => (
            <svg
              key={s}
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="#f97316"
              stroke="none"
              className="drop-shadow-sm"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <span className="shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          {review.course}
        </span>
      </div>

      {/* Quote */}
      <p className="flex-1 text-[11px] leading-relaxed text-[var(--text-muted)] mb-3 line-clamp-3">
        <span className="text-orange-500 text-base leading-none mr-0.5">&ldquo;</span>
        {review.text}
        <span className="text-orange-500 text-base leading-none ml-0.5">&rdquo;</span>
      </p>

      {/* Author */}
      <div className="flex items-center gap-2 border-t border-[var(--border)] pt-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white shadow-lg">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="text-[11px] font-bold text-[var(--text)]">{review.name}</p>
          <p className="text-[10px] text-[var(--text-subtle)] mt-0.5">{review.course}</p>
        </div>
      </div>
    </div>
  );
}
