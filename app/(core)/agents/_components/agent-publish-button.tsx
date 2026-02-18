'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';


type PhoneNumberItem = {
    phoneNumber: string;
    countryCode: 'US' | 'CA' | 'IN' | 'IT' | 'FR';
    nickname: string;
    inboundWebhookUrl: string;
    areaCode: number;
    allowedInboundCountry: Array<'US' | 'CA' | 'IN' | 'IT' | 'FR'>;
    allowedOutboundCountry: Array<'US' | 'CA' | 'IN' | 'IT' | 'FR'>;
    phoneNumberType: 'TWILIO' | 'CUSTOM' | 'TELNYX' | 'PLIVO';
    inboundAgentId: string;
    outboundAgentId: string;
    sipTrunkConfig: {
        terminationUri: string;
        authUsername: string;
        authPassword: string;
        transportType: 'UDP' | 'TCP' | 'TLS';
    };
    tollFree: boolean;
};

const ENABLE_TESTING = false
const TEST_NUMBER: PhoneNumberItem = {
    phoneNumber: "+14155550123",
    countryCode: "US",
    nickname: "Test US Number",
    inboundWebhookUrl: "https://api.reacherr.dev/webhooks/inbound-call",
    areaCode: 415,
    allowedInboundCountry: ["US", "CA"],
    allowedOutboundCountry: ["US", "CA", "IN"],
    phoneNumberType: "TWILIO",
    inboundAgentId: "94d24b7b-0368-44d0-a3f7-7145159310f9",
    outboundAgentId: "94d24b7b-0368-44d0-a3f7-7145159310f9",
    sipTrunkConfig: {
        terminationUri: "sip:test@sip.twilio.com",
        authUsername: "testuser",
        authPassword: "testpassword123",
        transportType: "TLS",
    },
    tollFree: false,
};

export default function AgentPublishButton() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberItem[]>([]);
    const [loadingPhones, setLoadingPhones] = useState(false);
    const [inboundChecked, setInboundChecked] = useState(false);
    const [outboundChecked, setOutboundChecked] = useState(false);
    const [inboundPhone, setInboundPhone] = useState('');
    const [outboundPhone, setOutboundPhone] = useState('');

    const { id: agentId } = useParams() as { id: string };
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;

        const loadPhoneNumbers = async () => {
            setLoadingPhones(true);
            try {
                const res = await fetch('/api/phone-numbers', { method: 'GET', cache: 'no-store' });
                const data = (await res.json().catch(() => null)) as { items?: unknown } | null;
                const items = Array.isArray(data?.items)
                    ? data.items.filter(
                        (item): item is PhoneNumberItem =>
                            typeof item === 'object' &&
                            item !== null &&
                            typeof (item as PhoneNumberItem).phoneNumber === 'string'
                    )
                    : [];
                if (!cancelled) setPhoneNumbers(items);
            } finally {
                if (!cancelled) setLoadingPhones(false);
            }
        };

        loadPhoneNumbers();
        return () => {
            cancelled = true;
        };
    }, [open]);

    // TEMP SIDE EFFECT
    useEffect(() => {
        if (!ENABLE_TESTING) return;
        if (!open) return;
        if (loadingPhones) return;

        setPhoneNumbers((prev) => {
            const exists = prev.some(
                (item) => item.phoneNumber === TEST_NUMBER.phoneNumber
            );

            if (exists) return prev;

            return [TEST_NUMBER, ...prev];
        });
    }, [open, loadingPhones]);

    const phoneLabel = (item: PhoneNumberItem) =>
        item.nickname?.trim()
            ? `${item.nickname.trim()} (${item.phoneNumber})`
            : (item.phoneNumber ?? '');

    const handlePublish = async () => {
        if (!agentId) {
            console.error("Agent ID missing");
            return;
        }

        try {
            setPublishing(true);

            const updates: Promise<Response>[] = [];

            // 🔹 INBOUND
            if (inboundChecked && inboundPhone) {
                const inboundItem = phoneNumbers.find(
                    (p) => p.phoneNumber === inboundPhone
                );

                if (!inboundItem) {
                    throw new Error("Selected inbound phone not found");
                }

                updates.push(
                    fetch(
                        `/api/phone-numbers/${encodeURIComponent(inboundItem.phoneNumber)}`,
                        {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                phoneNumber: inboundItem.phoneNumber,
                                isTollFree: inboundItem.tollFree,
                                countryCode: inboundItem.countryCode,
                                nickname: inboundItem.nickname,
                                inboundWebhookUrl: inboundItem.inboundWebhookUrl,
                                areaCode: inboundItem.areaCode,
                                allowedInboundCountry: inboundItem.allowedInboundCountry,
                                allowedOutboundCountry: inboundItem.allowedOutboundCountry,
                                phoneNumberType: inboundItem.phoneNumberType,
                                terminationUri: inboundItem.sipTrunkConfig.terminationUri,
                                authUserName: inboundItem.sipTrunkConfig.authUsername,
                                authPassword: inboundItem.sipTrunkConfig.authPassword,
                                transportType: inboundItem.sipTrunkConfig.transportType,
                                inboundAgentId: agentId,
                                outboundAgentId: inboundItem.outboundAgentId ?? null,
                            }),
                        }
                    )
                );
            }

            // 🔹 OUTBOUND
            if (outboundChecked && outboundPhone) {
                const outboundItem = phoneNumbers.find(
                    (p) => p.phoneNumber === outboundPhone
                );

                if (!outboundItem) {
                    throw new Error("Selected outbound phone not found");
                }

                updates.push(
                    fetch(
                        `/api/phone-numbers/${encodeURIComponent(outboundItem.phoneNumber)}`,
                        {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                phoneNumber: outboundItem.phoneNumber,
                                isTollFree: outboundItem.tollFree,
                                countryCode: outboundItem.countryCode,
                                nickname: outboundItem.nickname,
                                inboundWebhookUrl: outboundItem.inboundWebhookUrl,
                                areaCode: outboundItem.areaCode,
                                allowedInboundCountry: outboundItem.allowedInboundCountry,
                                allowedOutboundCountry: outboundItem.allowedOutboundCountry,
                                phoneNumberType: outboundItem.phoneNumberType,
                                terminationUri: outboundItem.sipTrunkConfig.terminationUri,
                                authUserName: outboundItem.sipTrunkConfig.authUsername,
                                authPassword: outboundItem.sipTrunkConfig.authPassword,
                                transportType: outboundItem.sipTrunkConfig.transportType,
                                outboundAgentId: agentId,
                                inboundAgentId: outboundItem.inboundAgentId ?? null,
                            }),
                        }
                    )
                );
            }

            // 🚨 No phone selected (allowed case)
            if (updates.length === 0) {
                console.log("Publishing without phone number");
                setOpen(false);
                return;
            }

            const responses = await Promise.all(updates);

            for (const res of responses) {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Phone update failed");
                }
            }

            console.log("Publish successful");
            setOpen(false);

        } catch (err) {
            console.error("Publish failed:", err);
        } finally {
            setPublishing(false);
        }
    };


    if (!agentId) return <></>

    const modal = open && mounted ? createPortal(
        <div
            className="fixed inset-0 z-[99999999] overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Publish agent"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
            }}
        >
            <div className="flex min-h-full items-center justify-center">
                <div className="max-h-[calc(100vh-3rem)] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-white/10 bg-[#111728] p-6 text-white shadow-[0_35px_130px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl font-semibold tracking-tight">Publish</h2>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                            aria-label="Close"
                        >
                            <span className="text-lg leading-none">×</span>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-white/90">
                                Version name <span className="text-foreground/50">(coming soon)</span>
                            </p>
                            <div className="flex h-11 items-center rounded-lg border border-white/15 bg-black/25 text-sm">
                                <span className="px-3 text-white/60">V0 -</span>
                                <input
                                    type="text"
                                    placeholder="add a descriptive name (optional)"
                                    className="h-full flex-1 rounded-r-lg bg-transparent pr-3 text-white outline-none placeholder:text-white/35"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-white/90">
                                Version Description <span className="text-foreground/50">(coming soon)</span>
                            </p>
                            <textarea
                                placeholder="Version description (optional)"
                                className="min-h-24 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm text-white/60">
                            <p>Pro tip: You can compare changes using Version Difference.</p>
                            <button
                                type="button"
                                className="rounded-xl border border-white/20 bg-black/30 px-4 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                            >
                                Compare
                            </button>
                        </div>

                        <div className="space-y-5 border-t border-white/10 pt-3">
                            <div>
                                <p className="text-base font-semibold text-white/90">Select Phone Number</p>
                                <p className="text-sm text-white/55">Phone number is optional. You can proceed without it.</p>
                            </div>

                            <div className='flex flex-col gap-3'>
                                <label className="flex items-center gap-2 text-sm text-white/90">
                                    <input
                                        type="checkbox"
                                        checked={inboundChecked}
                                        onChange={(event) => {
                                            setInboundChecked(event.target.checked);
                                            if (!event.target.checked) setInboundPhone('');
                                        }}
                                        className="h-4 w-4 rounded border-white/30 bg-transparent accent-blue-500"
                                    />
                                    Inbound phone number
                                </label>

                                {inboundChecked ? (
                                    <select
                                        value={inboundPhone}
                                        onChange={(event) => setInboundPhone(event.target.value)}
                                        disabled={loadingPhones}
                                        className="h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 text-sm text-white outline-none transition disabled:opacity-60"
                                    >
                                        <option value="" className="bg-[#111728]">
                                            {loadingPhones ? 'Loading phone numbers...' : 'Select a phone number'}
                                        </option>
                                        {phoneNumbers.map((item) => (
                                            <option key={item.phoneNumber} value={item.phoneNumber} className="bg-[#111728]">
                                                {phoneLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}

                                <label className="flex items-center gap-2 text-sm text-white/90">
                                    <input
                                        type="checkbox"
                                        checked={outboundChecked}
                                        onChange={(event) => {
                                            setOutboundChecked(event.target.checked);
                                            if (!event.target.checked) setOutboundPhone('');
                                        }}
                                        className="h-4 w-4 rounded border-white/30 bg-transparent accent-blue-500"
                                    />
                                    Outbound phone number
                                </label>

                                {outboundChecked ? (
                                    <select
                                        value={outboundPhone}
                                        onChange={(event) => setOutboundPhone(event.target.value)}
                                        disabled={loadingPhones}
                                        className="h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 text-sm text-white outline-none transition disabled:opacity-60"
                                    >
                                        <option value="" className="bg-[#111728]">
                                            {loadingPhones ? 'Loading phone numbers...' : 'Select a phone number'}
                                        </option>
                                        {phoneNumbers.map((item) => (
                                            <option key={item.phoneNumber} value={item.phoneNumber} className="bg-[#111728]">
                                                {phoneLabel(item)}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/70">
                            <span>You can now deploy to Call/Chat Widgets</span>
                            <button type="button" className="font-semibold text-white/80 transition hover:text-white">
                                See Docs
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-xl border border-white/15 px-6 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={publishing}
                            className="rounded-xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                            Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <Button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(12,14,55,0.55)] hover:bg-white/20"
            >
                Publish
            </Button>
            {modal}
        </>
    );
}
