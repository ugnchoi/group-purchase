"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parsePhoneNumber } from "libphonenumber-js";
import { toast } from "sonner";
import {
  trackPageView,
  trackOrderSubmitted,
  trackNotifySubmitted,
} from "@/lib/analytics";

function useQuery() {
  return useMemo(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);
}

const Readonly = ({
  label,
  value,
  id,
}: {
  label: string;
  value: string;
  id: string;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium text-zinc-800">
      {label}
    </Label>
    <Input
      id={id}
      readOnly
      value={value ?? ""}
      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700"
    />
  </div>
);

export default function Landing() {
  const q = useQuery();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Validation states
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [notifyPhoneError, setNotifyPhoneError] = useState("");

  // Prefill values from QR URL
  const buildingName = q.get("buildingName") || "헬리오시티";
  const unit = q.get("unit") || ""; // optional

  // Service type state (user can select from dropdown)
  const [selectedServiceType, setSelectedServiceType] = useState("유리청소");

  // Campaign state
  const [campaignId, setCampaignId] = useState("");
  const [minimumOrders, setMinimumOrders] = useState(20);
  const [currentOrders, setCurrentOrders] = useState(0);
  const [campaignLoading, setCampaignLoading] = useState(true);

  // Validation functions
  const validateName = (value: string): string => {
    if (!value.trim()) {
      return "이름을 입력해주세요";
    }
    if (value.trim().length < 2) {
      return "이름은 2자 이상 입력해주세요";
    }
    if (value.trim().length > 20) {
      return "이름은 20자 이하로 입력해주세요";
    }
    return "";
  };

  const validatePhone = (value: string): string => {
    if (!value.trim()) {
      return "전화번호를 입력해주세요";
    }

    try {
      const phoneNumber = parsePhoneNumber(value, "KR");
      if (!phoneNumber || !phoneNumber.isValid()) {
        return "올바른 전화번호 형식을 입력해주세요";
      }
      return "";
    } catch {
      return "올바른 전화번호 형식을 입력해주세요";
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(validateName(value));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setPhoneError(validatePhone(value));
  };

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await fetch(
          `/api/campaigns?buildingName=${encodeURIComponent(buildingName)}&serviceType=${encodeURIComponent(selectedServiceType)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setCampaignId(data.campaignId);
          setMinimumOrders(data.minOrders);
          setCurrentOrders(data.currentOrders);

          // Track page view with campaign data
          trackPageView(data.campaignId, selectedServiceType, buildingName);
        }
      } catch (error) {
        console.error("Error loading campaign:", error);
      } finally {
        setCampaignLoading(false);
      }
    };

    loadCampaign();
  }, [buildingName, selectedServiceType]);

  // Poll for updated campaign data
  useEffect(() => {
    if (!campaignId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/campaigns?buildingName=${encodeURIComponent(buildingName)}&serviceType=${encodeURIComponent(selectedServiceType)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentOrders(data.currentOrders);
        }
      } catch {
        // Silently ignore polling errors in UI
      }
    }, 15_000);

    return () => {
      clearInterval(interval);
    };
  }, [campaignId, buildingName, selectedServiceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const nameValidation = validateName(name);
    const phoneValidation = validatePhone(phone);

    setNameError(nameValidation);
    setPhoneError(phoneValidation);

    if (nameValidation || phoneValidation || !consent) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          campaignId,
          unit,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setCurrentOrders((prev) => prev + 1);

        // Track order submission
        trackOrderSubmitted(campaignId, selectedServiceType, buildingName);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("주문 제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone for notification
    const phoneValidation = validatePhone(notifyPhone);
    setNotifyPhoneError(phoneValidation);

    if (phoneValidation) {
      return;
    }

    setNotifySubmitting(true);
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: notifyPhone,
          campaignId,
        }),
      });

      if (response.ok) {
        setNotifySubmitted(true);

        // Track notification submission
        trackNotifySubmitted(campaignId, selectedServiceType, buildingName);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to submit notification request");
      }
    } catch (error) {
      console.error("Error submitting notification request:", error);
      toast.error("알림 요청 제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setNotifySubmitting(false);
    }
  };

  const progress = Math.min((currentOrders / minimumOrders) * 100, 100);
  const remaining = Math.max(minimumOrders - currentOrders, 0);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mb-6 text-6xl">🎉</div>
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                주문이 완료되었습니다!
              </h1>
              <p className="mb-8 text-lg text-gray-600">
                {name}님의 {selectedServiceType} 주문이 성공적으로
                접수되었습니다.
              </p>
              <div className="space-y-4 rounded-2xl bg-blue-50 p-6">
                <h2 className="text-xl font-semibold text-blue-900">
                  주문 정보
                </h2>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-blue-700">서비스:</span>
                    <span className="font-medium">{selectedServiceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">건물:</span>
                    <span className="font-medium">{buildingName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">연락처:</span>
                    <span className="font-medium">{phone}</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  새로운 주문하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            공동구매 참여
          </h1>
          <p className="text-lg text-gray-600">
            {selectedServiceType} 서비스를 {buildingName}에서 함께 이용해보세요
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">주문 현황</h2>
            <span className="text-sm text-gray-500">
              {currentOrders}/{minimumOrders}명
            </span>
          </div>
          <div
            className="mb-4 h-3 rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={currentOrders}
            aria-valuemin={0}
            aria-valuemax={minimumOrders}
            aria-label={`주문 진행률: ${currentOrders}명 중 ${minimumOrders}명 달성`}
          >
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-500 mb-2">
            {Math.round(progress)}% 완료
          </div>
          <div className="text-center">
            {remaining > 0 ? (
              <p className="text-lg font-medium text-gray-700">
                <span className="text-blue-600">{remaining}명</span> 더 모이면
                시작됩니다!
              </p>
            ) : (
              <p className="text-lg font-medium text-green-600">
                🎉 최소 주문 수량이 달성되었습니다!
              </p>
            )}
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            서비스 정보
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="service"
                className="text-sm font-medium text-gray-800"
              >
                서비스 선택 *
              </Label>
              <Select
                value={selectedServiceType}
                onValueChange={setSelectedServiceType}
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-200 px-3 py-2">
                  <SelectValue placeholder="서비스를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="유리청소">유리청소</SelectItem>
                  <SelectItem value="방충망 보수">방충망 보수</SelectItem>
                  <SelectItem value="에어컨 청소">에어컨 청소</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Readonly label="건물" value={buildingName} id="building" />
          </div>
        </div>

        {/* Order Form */}
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            주문 정보 입력
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-800"
              >
                이름 *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className={`w-full rounded-xl border px-3 py-2 ${
                  nameError ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="홍길동"
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-800"
              >
                연락처 *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                className={`w-full rounded-xl border px-3 py-2 ${
                  phoneError ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="01012345678 또는 010-1234-5678"
              />
              {phoneError && (
                <p className="text-sm text-red-500">{phoneError}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
                required
              />
              <Label htmlFor="consent" className="text-sm text-gray-700">
                개인정보 수집 및 이용에 동의합니다 *
              </Label>
            </div>
            <Button
              type="submit"
              disabled={!consent || submitting || campaignLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting
                ? "제출 중..."
                : campaignLoading
                  ? "로딩 중..."
                  : "주문하기"}
            </Button>
          </form>
        </div>

        {/* Notification Form */}
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            알림 신청
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            최소 주문 수량이 달성되면 알림을 받으실 수 있습니다.
          </p>
          {notifySubmitted ? (
            <div className="rounded-xl bg-green-50 p-4 text-center">
              <p className="text-green-800">알림 신청이 완료되었습니다!</p>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="notify-phone"
                  className="text-sm font-medium text-gray-800"
                >
                  연락처
                </Label>
                <Input
                  id="notify-phone"
                  type="tel"
                  value={notifyPhone}
                  onChange={(e) => {
                    setNotifyPhone(e.target.value);
                    setNotifyPhoneError(validatePhone(e.target.value));
                  }}
                  className={`w-full rounded-xl border px-3 py-2 ${
                    notifyPhoneError ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="010-1234-5678"
                />
                {notifyPhoneError && (
                  <p className="text-sm text-red-500">{notifyPhoneError}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={notifySubmitting || campaignLoading}
                variant="outline"
                className="w-full"
              >
                {notifySubmitting
                  ? "신청 중..."
                  : campaignLoading
                    ? "로딩 중..."
                    : "알림 신청하기"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
