"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 4500); // Animation duration + a little extra
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const parentName = session?.user?.fullName || session?.user?.name || "Parent";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const features = [
    { icon: "⏰", text: "Screen Time Control" },
    { icon: "🎯", text: "Study Goals" },
    { icon: "🏆", text: "Smart Rewards" },
    { icon: "🛡️", text: "Family Safety" },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center p-4 z-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1
        className="text-4xl md:text-6xl font-extrabold mb-4 text-center"
        variants={itemVariants}
      >
        Welcome to SmartDocs Family Guardian, {parentName}!
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl text-purple-200 mb-10 text-center max-w-2xl"
        variants={itemVariants}
      >
        Study First. Earn Screen Time.
      </motion.p>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-12"
        variants={containerVariants}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center text-center p-4 bg-white/10 rounded-xl shadow-lg"
            variants={featureVariants}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <span className="text-4xl mb-3">{feature.icon}</span>
            <p className="text-sm md:text-base font-semibold">{feature.text}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="text-sm text-purple-300 text-center"
        variants={itemVariants}
      >
        Get ready to empower your family with smart digital habits.
      </motion.p>
    </motion.div>
  );
}