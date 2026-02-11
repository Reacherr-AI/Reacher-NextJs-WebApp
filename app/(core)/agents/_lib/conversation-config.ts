// below are status stored results
// GET /api/v1/conversation/config


const data = {
    "llm": {
        "providers": [
            {
                "name": "OpenAI",
                "slug": "openai",
                "models": [
                    {
                        "name": "gpt-4.1",
                        "provider": "openai",
                        "displayName": "GPT-4.1",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-4.1-mini",
                        "provider": "openai",
                        "displayName": "GPT-4.1 Mini",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-4.1-nano",
                        "provider": "openai",
                        "displayName": "GPT-4.1 Nano",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-5",
                        "provider": "openai",
                        "displayName": "GPT-5",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-5.1",
                        "provider": "openai",
                        "displayName": "GPT-5.1",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-5.2",
                        "provider": "openai",
                        "displayName": "GPT-5.2",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-5-mini",
                        "provider": "openai",
                        "displayName": "GPT-5-mini",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    },
                    {
                        "name": "gpt-5-nano",
                        "provider": "openai",
                        "displayName": "GPT-5-nano",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    }
                ]
            },
            {
                "name": "Anthropic",
                "slug": "anthropic",
                "models": [
                    {
                        "name": "claude-4.5-sonnet",
                        "provider": "anthropic",
                        "displayName": "Claude 4.5 Sonnet",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "max_tokens": true
                        }
                    }
                ]
            },
            {
                "name": "Google (Gemini)",
                "slug": "google",
                "models": [
                    {
                        "name": "gemini-3-flash-preview",
                        "provider": "google",
                        "displayName": "Gemini 3.0 Flash",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "top_k": true
                        }
                    },
                    {
                        "name": "gemini-2.5-flash",
                        "provider": "google",
                        "displayName": "Gemini 2.5 Flash",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "top_k": true
                        }
                    },
                    {
                        "name": "gemini-2.5-flash-lite",
                        "provider": "google",
                        "displayName": "Gemini 2.5 Flash Lite",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true,
                            "top_k": true
                        }
                    }
                ]
            },
            {
                "name": "xAI (Grok)",
                "slug": "xai",
                "models": [
                    {
                        "name": "grok-4-1-fast-reasoning",
                        "provider": "xai",
                        "displayName": "Grok 4.1 Fast (Reasoning)",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true
                        }
                    },
                    {
                        "name": "grok-4-1-fast-non-reasoning",
                        "provider": "xai",
                        "displayName": "Grok 4.1 Fast (Standard)",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true
                        }
                    },
                    {
                        "name": "grok-4-fast-reasoning",
                        "provider": "xai",
                        "displayName": "Grok 4 Fast (Reasoning)",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true
                        }
                    },
                    {
                        "name": "grok-4-fast-non-reasoning",
                        "provider": "xai",
                        "displayName": "Grok 4 Fast (Standard)",
                        "modality": "LLM",
                        "configs": {
                            "temperature": true
                        }
                    }
                ]
            }
        ]
    },
    "voice": {
        "languages": [
            {
                "code": "en",
                "name": "English"
            },
            {
                "code": "hi",
                "name": "Hindi"
            },
            {
                "code": "bn",
                "name": "Bengali"
            },
            {
                "code": "de",
                "name": "German"
            },
            {
                "code": "es",
                "name": "Spanish"
            },
            {
                "code": "fr",
                "name": "French"
            },
            {
                "code": "gu",
                "name": "Gujarati"
            },
            {
                "code": "it",
                "name": "Italian"
            },
            {
                "code": "ja",
                "name": "Japanese"
            },
            {
                "code": "kn",
                "name": "Kannada"
            },
            {
                "code": "ko",
                "name": "Korean"
            },
            {
                "code": "ml",
                "name": "Malayalam"
            },
            {
                "code": "mr",
                "name": "Marathi"
            },
            {
                "code": "pa",
                "name": "Punjabi"
            },
            {
                "code": "pt",
                "name": "Portuguese"
            },
            {
                "code": "ta",
                "name": "Tamil"
            },
            {
                "code": "te",
                "name": "Telugu"
            },
            {
                "code": "zh",
                "name": "Chinese"
            }
        ],
        "providers": [
            {
                "name": "ElevenLabs",
                "slug": "elevenlabs",
                "models": [
                    {
                        "name": "eleven_turbo_v2_5",
                        "displayName": "Turbo v2.5",
                        "modality": "TTS",
                        "configs": {
                            "speed": true,
                            "similarity_boost": true,
                            "stability": true,
                            "style_exaggeration": true
                        },
                        "languages": [
                            "en",
                            "ja",
                            "zh",
                            "de",
                            "hi",
                            "fr",
                            "ko",
                            "pt",
                            "it",
                            "es"
                        ],
                        "TTSVoices": []
                    },
                    {
                        "name": "eleven_flash_v2_5",
                        "displayName": "Flash v2.5",
                        "modality": "TTS",
                        "configs": {
                            "speed": true,
                            "similarity_boost": true,
                            "stability": true,
                            "style_exaggeration": true
                        },
                        "languages": [
                            "en",
                            "ja",
                            "zh",
                            "de",
                            "hi",
                            "fr",
                            "ko",
                            "pt",
                            "it",
                            "es"
                        ],
                        "TTSVoices": []
                    },
                    {
                        "name": "eleven_v3",
                        "displayName": "Eleven v3 (Alpha)",
                        "modality": "TTS",
                        "configs": {
                            "speed": true,
                            "similarity_boost": true,
                            "stability": true,
                            "style_exaggeration": true
                        },
                        "languages": [
                            "en",
                            "ja",
                            "zh",
                            "de",
                            "hi",
                            "fr",
                            "ko",
                            "pt",
                            "it",
                            "es"
                        ],
                        "TTSVoices": []
                    }
                ]
            },
            {
                "name": "Cartesia",
                "slug": "cartesia",
                "models": [
                    {
                        "name": "sonic-english",
                        "displayName": "Sonic 3",
                        "modality": "TTS",
                        "configs": {
                            "speed": true,
                            "temperature": true
                        },
                        "languages": [
                            "en"
                        ],
                        "TTSVoices": [
                            {
                                "voiceId": "e07c00bc-4134-4eae-9ea4-1a55fb45746b",
                                "displayName": "Brooke - Big Sister",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "f786b574-daa5-4673-aa0c-cbe3e8534c02",
                                "displayName": "Katie - Friendly Fixer",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
                                "displayName": "Jacqueline - Reassuring Agent",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "f9836c6e-a0bd-460e-9d3c-f7299fa60f94",
                                "displayName": "Caroline - Southern Guide",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "5ee9feff-1265-424a-9d7f-8e4d431a12c7",
                                "displayName": "Ronald - Thinker",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "a167e0f3-df7e-4d52-a9c3-f949145efdab",
                                "displayName": "Blake - Helpful Agent",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "e8e5fffb-252c-436d-b842-8879b84445b6",
                                "displayName": "Cathy - Coworker",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "a5136bf9-224c-4d76-b823-52bd5efcffcc",
                                "displayName": "Jameson - Easygoing Support",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "86e30c1d-714b-4074-a1f2-1cb6b552fb49",
                                "displayName": "Carson - Curious Conversationalist",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "47c38ca4-5f35-497b-b1a3-415245fb35e1",
                                "displayName": "Daniel - Modern Assistant",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "faf0731e-dfb9-4cfc-8119-259a79b27e12",
                                "displayName": "Riya - College Roommate",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "95d51f79-c397-46f9-b49a-23763d3eaa2d",
                                "displayName": "Arushi - Hinglish Speaker",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "bec003e2-3cb3-429c-8468-206a393c67ad",
                                "displayName": "Parvati - Friendly Supporter",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "7e8cb11d-37af-476b-ab8f-25da99b18644",
                                "displayName": "Anuj - Engaging Narrator",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "47f3bbb1-e98f-4e0c-92c5-5f0325e1e206",
                                "displayName": "Neha - Virtual Assistant",
                                "gender": "Female",
                                "accent": null,
                                "avatarUrl": null
                            },
                            {
                                "voiceId": "6303e5fb-a0a7-48f9-bb1a-dd42c216dc5d",
                                "displayName": "Sagar - Helpful Friend",
                                "gender": "Male",
                                "accent": null,
                                "avatarUrl": null
                            }
                        ]
                    },
                    {
                        "name": "ink-whisper",
                        "displayName": "Ink Whisper",
                        "modality": "STT",
                        "configs": {
                            "keyword_boost": true
                        },
                        "languages": [
                            "en",
                            "fr",
                            "de",
                            "es",
                            "ja",
                            "zh"
                        ],
                        "TTSVoices": null
                    }
                ]
            },
            {
                "name": "Deepgram",
                "slug": "deepgram",
                "models": [
                    {
                        "name": "nova-2",
                        "displayName": "Nova 2",
                        "modality": "STT",
                        "configs": {
                            "keyword_boost": true
                        },
                        "languages": [
                            "de",
                            "en",
                            "es",
                            "fr",
                            "hi",
                            "it",
                            "ja",
                            "ko",
                            "pt",
                            "zh"
                        ],
                        "supportsKeywords": true
                    },
                    {
                        "name": "nova-3",
                        "displayName": "Nova 3",
                        "modality": "STT",
                        "configs": {
                            "keyword_boost": true
                        },
                        "languages": [
                            "de",
                            "en",
                            "es",
                            "fr",
                            "hi",
                            "it",
                            "ja",
                            "ko",
                            "pt",
                            "zh"
                        ],
                        "supportsKeywords": true
                    }
                ]
            },
            {
                "name": "Sarvam AI",
                "slug": "sarvam",
                "models": [
                    {
                        "name": "bulbul:v2",
                        "displayName": "Bulbul v2",
                        "modality": "TTS",
                        "configs": {
                            "speed": true,
                            "temperature": true
                        },
                        "languages": [
                            "hi",
                            "bn",
                            "ta",
                            "te",
                            "gu",
                            "kn",
                            "ml",
                            "mr",
                            "pa",
                            "od",
                            "en"
                        ],
                        "TTSVoices": []
                    },
                    {
                        "name": "saaras:v2.5",
                        "displayName": "Saaras v2.5",
                        "modality": "STT",
                        "configs": {
                            "keyword_boost": true
                        },
                        "languages": [
                            "hi",
                            "bn",
                            "ta",
                            "te",
                            "gu",
                            "kn",
                            "ml",
                            "mr",
                            "pa",
                            "od",
                            "en"
                        ],
                        "supportsKeywords": true
                    },
                    {
                        "name": "saarika:v2.5",
                        "displayName": "Saarika v2.5",
                        "modality": "STT",
                        "configs": {
                            "keyword_boost": true
                        },
                        "languages": [
                            "hi",
                            "bn",
                            "ta",
                            "te",
                            "gu",
                            "kn",
                            "ml",
                            "mr",
                            "pa",
                            "od",
                            "en"
                        ],
                        "supportsKeywords": true
                    }
                ]
            }
        ]
    }
}

export type Modality = 'LLM' | 'TTS' | 'STT'

export type LanguageCode = string
export type ProviderSlug = string
export type ModelName = string


export type ModelConfigs = {
    temperature?: boolean
    max_tokens?: boolean
    top_k?: boolean
    speed?: boolean
    similarity_boost?: boolean
    stability?: boolean
    style_exaggeration?: boolean
    keyword_boost?: boolean
}

export type LlmModel = {
    name: ModelName
    provider: ProviderSlug
    displayName: string
    modality: 'LLM'
    configs: ModelConfigs
}

export type LlmProvider = {
    name: string
    slug: ProviderSlug
    models: LlmModel[]
}

export type TTSVoice = {
    voiceId: string
    displayName: string
    gender: 'Male' | 'Female' | string
    accent?: string | null
    avatarUrl?: string | null
}

export type VoiceModel = {
    name: ModelName
    displayName: string
    modality: 'TTS' | 'STT'
    configs: ModelConfigs
    languages: LanguageCode[]
    TTSVoices?: TTSVoice[] | null
    supportsKeywords?: boolean
}

export type VoiceProvider = {
    name: string
    slug: ProviderSlug
    models: VoiceModel[]
}

export type Language = {
    code: LanguageCode
    name: string
}

export type ConversationConfigResponse = {
    llm: {
        providers: LlmProvider[]
    }
    voice: {
        languages: Language[]
        providers: VoiceProvider[]
    }
}

// Local snapshot of backend config (GET /api/v1/conversation/config).
// Used to populate dropdowns without requiring a runtime fetch.
export const conversationConfigStoredResults = data as ConversationConfigResponse


export const getLanguages = (data: ConversationConfigResponse): Language[] => {
    return data.voice.languages
}

export type ProviderOption<TModel> = {
    label: string
    value: ProviderSlug
    models: TModel[]
}

export type LlmModelOption = {
    label: string
    value: ModelName
    configs: ModelConfigs
}

export type TtsModelOption = {
    label: string
    value: ModelName
    languages: LanguageCode[]
    voices: TTSVoice[]
    configs: ModelConfigs
}

export type SttModelOption = {
    label: string
    value: ModelName
    languages: LanguageCode[]
    supportsKeywords: boolean
    configs: ModelConfigs
}

export const getLLMProviders = (data: ConversationConfigResponse): ProviderOption<LlmModelOption>[] => {
    return data.llm.providers.map(provider => ({
        label: provider.name,
        value: provider.slug,
        models: provider.models.map(model => ({
            label: model.displayName,
            value: model.name,
            configs: model.configs,
        })),
    }))
}

export const getTTSProvidersWithLanguages = (data: ConversationConfigResponse): ProviderOption<TtsModelOption>[] => {
    return data.voice.providers
        .map(provider => {
            const ttsModels = provider.models.filter(m => m.modality === 'TTS')
            if (!ttsModels.length) return null

            const option: ProviderOption<TtsModelOption> = {
                label: provider.name,
                value: provider.slug,
                models: ttsModels.map(model => ({
                    label: model.displayName,
                    value: model.name,
                    languages: model.languages,
                    voices: model.TTSVoices ?? [],
                    configs: model.configs,
                })),
            }
            return option
        })
        .filter((opt): opt is ProviderOption<TtsModelOption> => Boolean(opt))
}

export const getSTTProvidersWithLanguages = (data: ConversationConfigResponse): ProviderOption<SttModelOption>[] => {
    return data.voice.providers
        .map(provider => {
            const sttModels = provider.models.filter(m => m.modality === 'STT')
            if (!sttModels.length) return null

            const option: ProviderOption<SttModelOption> = {
                label: provider.name,
                value: provider.slug,
                models: sttModels.map(model => ({
                    label: model.displayName,
                    value: model.name,
                    languages: model.languages,
                    supportsKeywords: model.supportsKeywords ?? false,
                    configs: model.configs,
                })),
            }
            return option
        })
        .filter((opt): opt is ProviderOption<SttModelOption> => Boolean(opt))
}

export const getLanguagesByVoiceProvider = (
    data: ConversationConfigResponse,
) => {
    return data.voice.providers.map(provider => {
        const languages = new Set<string>()

        provider.models.forEach(model => {
            model.languages.forEach(lang => languages.add(lang))
        })

        return {
            provider: provider.slug,
            languages: Array.from(languages),
        }
    })
}
