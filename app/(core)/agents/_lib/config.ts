export type AgentVoiceConfig = {
    voiceId: string;
    voiceName: string;
    provider: string;
    gender: string;
    accent: string;
    age: string;
    avatarUrl: string | null;
    previewAudioUrl: string | null;
    recommended: boolean;
    supportedLanguages: string[];
};

const VOICE_CONFIG: AgentVoiceConfig[] = [
    {
        "voiceId": "cartesia-brooke",
        "voiceName": "Brooke",
        "provider": "cartesia",
        "gender": "female",
        "accent": "American",
        "age": "Young",
        "avatarUrl": "https://reacherr.ai/brooke.png",
        "previewAudioUrl": "https://api.cartesia.ai/previews/brooke.mp3",
        "recommended": true,
        "supportedLanguages": [
            "en"
        ]
    },
    {
        "voiceId": "11labs-adrian",
        "voiceName": "Adrian",
        "provider": "elevenlabs",
        "gender": "male",
        "accent": "American",
        "age": "Young",
        "avatarUrl": "https://reacherr.ai/adrian.png",
        "previewAudioUrl": "https://retell-utils-public.s3.us-west-2.amazonaws.com/adrian.mp3",
        "recommended": true,
        "supportedLanguages": [
            "bn",
            "de",
            "en",
            "es",
            "fr",
            "gu",
            "hi",
            "it",
            "ja",
            "kn",
            "ko",
            "ml",
            "mr",
            "pa",
            "pt",
            "ta",
            "te",
            "zh"
        ]
    },
    {
        "voiceId": "openai-alloy",
        "voiceName": "Alloy",
        "provider": "openai",
        "gender": "male",
        "accent": "American",
        "age": "Young",
        "avatarUrl": "https://reacherr.ai/alloy.png",
        "previewAudioUrl": "https://cdn.openai.com/api/v1/voices/alloy.mp3",
        "recommended": false,
        "supportedLanguages": [
            "bn",
            "de",
            "en",
            "es",
            "fr",
            "gu",
            "hi",
            "it",
            "ja",
            "kn",
            "ko",
            "ml",
            "mr",
            "pa",
            "pt",
            "ta",
            "te",
            "zh"
        ]
    },
    {
        "voiceId": "sarvam-v2-hindi-female",
        "voiceName": "Bulbul",
        "provider": "sarvam",
        "gender": "female",
        "accent": "Hindi",
        "age": "Young",
        "avatarUrl": null,
        "previewAudioUrl": null,
        "recommended": true,
        "supportedLanguages": [
            "hi",
            "bn",
            "ta"
        ]
    },
    {
        "voiceId": "11labs-Andrew",
        "voiceName": "Andrew",
        "provider": "elevenlabs",
        "gender": "unknown",
        "accent": "neutral",
        "age": "unknown",
        "avatarUrl": null,
        "previewAudioUrl": null,
        "recommended": true,
        "supportedLanguages": [
            "bn",
            "de",
            "en",
            "es",
            "fr",
            "gu",
            "hi",
            "it",
            "ja",
            "kn",
            "ko",
            "ml",
            "mr",
            "pa",
            "pt",
            "ta",
            "te",
            "zh"
        ]
    },
    {
        "voiceId": "openai-Anna",
        "voiceName": "Anna",
        "provider": "openai",
        "gender": "unknown",
        "accent": "neutral",
        "age": "unknown",
        "avatarUrl": null,
        "previewAudioUrl": null,
        "recommended": true,
        "supportedLanguages": [
            "bn",
            "de",
            "en",
            "es",
            "fr",
            "gu",
            "hi",
            "it",
            "ja",
            "kn",
            "ko",
            "ml",
            "mr",
            "pa",
            "pt",
            "ta",
            "te",
            "zh"
        ]
    },
    {
        "voiceId": "minimax-Crystal",
        "voiceName": "Crystal",
        "provider": "minimax",
        "gender": "unknown",
        "accent": "neutral",
        "age": "unknown",
        "avatarUrl": null,
        "previewAudioUrl": null,
        "recommended": true,
        "supportedLanguages": [
            "en",
            "zh"
        ]
    }
];

export const getVoiceConfig = (): AgentVoiceConfig[] => VOICE_CONFIG;

export const getVoiceConfigByLanguage = (language: string | undefined): AgentVoiceConfig[] => {
    const normalized = (language ?? '').trim().toLowerCase();
    if (!normalized) return VOICE_CONFIG;
    return VOICE_CONFIG.filter((voice) =>
        Array.isArray(voice.supportedLanguages) &&
        voice.supportedLanguages.some((code) => String(code).trim().toLowerCase() === normalized)
    );
};
