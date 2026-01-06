"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 1 - Profile Setup
  const [profileData, setProfileData] = useState({
    firstName: "",
    email: "",
    password: "",
  });

  // Step 2 - Challenge Selection
  const [challengeData, setChallengeData] = useState({
    selectedChallenge: "daily", // daily, weekly, monthly
    selectedMultiplier: 1,
  });

  const challenges = {
    daily: { name: "Daily", base: 27.4, yearlyGoal: 10000 },
    weekly: { name: "Weekly", base: 191.8, yearlyGoal: 10000 },
    monthly: { name: "Monthly", base: 849.4, yearlyGoal: 10000 },
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate profile data
    if (!profileData.firstName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!profileData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!profileData.password.trim()) {
      setError("Password is required");
      return;
    }
    if (profileData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setStep(2);
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const challenge = challenges[challengeData.selectedChallenge as keyof typeof challenges];
      const dailyAmount = challenge.base * challengeData.selectedMultiplier;

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileData.firstName,
          email: profileData.email,
          password: profileData.password,
          selectedChallenge: challengeData.selectedChallenge,
          multiplier: challengeData.selectedMultiplier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // Redirect to login
      router.push("/auth/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.push("/auth/login");
    }
  };

  const currentChallenge = challenges[challengeData.selectedChallenge as keyof typeof challenges];
  const dailyAmount = currentChallenge.base * challengeData.selectedMultiplier;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="text-[#10B981] hover:text-[#0D8659] transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 2
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1 - Create Account */}
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600 text-sm mb-8">
              Let's get your profile set up to track your progress.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleNextStep} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="e.g Alex Johnson"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-gray-400 text-gray-900"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-gray-400 text-gray-900"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Your password"
                    value={profileData.password}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-gray-400 text-gray-900 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-[#0D8659] text-white font-bold py-3 px-6 rounded-lg transition-colors mt-8"
              >
                Next: Choose Challenge
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#10B981] hover:text-[#0D8659] font-bold">
                  Login
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2 - Choose Challenge */}
        {step === 2 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Challenge</h2>

            {/* Challenge Options */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {Object.entries(challenges).map(([key, challenge]) => (
                <button
                  key={key}
                  onClick={() => setChallengeData({ ...challengeData, selectedChallenge: key })}
                  className={`p-6 rounded-lg border-2 transition-all ${challengeData.selectedChallenge === key
                      ? "border-[#10B981] bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div className="font-bold text-gray-900">{challenge.name}</div>
                  <div className="text-sm text-gray-600">
                    ${challenge.base.toFixed(2)} Base
                  </div>
                </button>
              ))}
            </div>

            {/* Multiplier Selection */}
            <div className="mb-8">
              <div className="font-bold text-gray-900 mb-6">
                <span className="text-gray-700">Multiplier: </span>
                <span className="text-[#10B981]">x{challengeData.selectedMultiplier}</span>
              </div>

              {/* Slider with track and labels */}
              <div className="relative">
                {/* Track container */}
                <div className="relative h-10 mb-2">
                  {/* Background track */}
                  <div className="absolute top-3 left-0 right-0 h-2 bg-emerald-100 rounded-full"></div>

                  {/* Active track */}
                  <div
                    className="absolute top-3 h-2 bg-[#10B981] rounded-full transition-all duration-200"
                    style={{
                      width: `calc(${((challengeData.selectedMultiplier - 1) / 9) * 100}% + 8px)`,
                    }}
                  ></div>

                  {/* Slider dot */}
                  <div
                    className="absolute top-0 w-8 h-8 bg-[#10B981] rounded-full border-4 border-white shadow-lg transition-all duration-200 cursor-pointer"
                    style={{
                      left: `${((challengeData.selectedMultiplier - 1) / 9) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  ></div>
                </div>

                {/* Labels row */}
                <div className="flex justify-between text-sm font-medium text-gray-700 px-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((mult) => (
                    <button
                      key={mult}
                      onClick={() => setChallengeData({ ...challengeData, selectedMultiplier: mult })}
                      className={`transition-colors ${challengeData.selectedMultiplier === mult
                          ? "text-[#10B981] font-bold"
                          : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      x{mult}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Commitment Card */}
            <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Your Commitment</div>
                  <div className="text-5xl font-bold text-[#10B981]">
                    ${dailyAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">per Day</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    ${currentChallenge.yearlyGoal.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Yearly Goal</div>
                </div>
              </div>
            </div>

            {/* Start Saving Button */}
            <button
              onClick={handleCompleteSignup}
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0D8659] disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? "Creating Account..." : "Start Saving Now →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
