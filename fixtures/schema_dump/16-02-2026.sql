apoorvjain@apoorvs-MacBook-Air ~ % pg_dump -h 3.7.2.72 -U reacherr_db_user -d reacherr_db --schema-only
Password:
Password: 
--
-- PostgreSQL database dump
--

\restrict ms3Jrd7JpyJt4UmEA6askYdx1VgrsnOBkBwCtubxuWDJzQRCc4wM5QYLhbtFqqy

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_templates; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.agent_templates (
    id uuid NOT NULL,
    agent_type character varying(255) NOT NULL,
    description character varying(1000) NOT NULL,
    industry_type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    reacherrllmdto jsonb,
    CONSTRAINT agent_templates_agent_type_check CHECK (((agent_type)::text = ANY ((ARRAY['SINGLE_PROMPT'::character varying, 'CONVERSATIONAL_FLOW'::character varying, 'CUSTOM'::character varying])::text[]))),
    CONSTRAINT agent_templates_industry_type_check CHECK (((industry_type)::text = ANY ((ARRAY['HEALTH_CARE'::character varying, 'BANKING'::character varying, 'REAL_ESTATE'::character varying, 'LOGISTICS'::character varying, 'E_COMMERCE'::character varying, 'HOSPITALITY'::character varying, 'EDUCATION'::character varying, 'LEGAL'::character varying])::text[])))
);


ALTER TABLE public.agent_templates OWNER TO reacherr_db_user;

--
-- Name: chat_agents; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.chat_agents (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    analysis_successful_prompt character varying(255),
    analysis_summary_prompt character varying(255),
    auto_close_message text,
    created_at timestamp(6) with time zone NOT NULL,
    end_chat_after_silence_ms integer,
    is_published boolean NOT NULL,
    language character varying(255) NOT NULL,
    last_updated_at timestamp(6) with time zone NOT NULL,
    pii_config jsonb,
    post_chat_analysis_data jsonb,
    post_chat_analysis_model character varying(255),
    version integer NOT NULL,
    webhook_timeout_ms integer,
    webhook_url character varying(255),
    response_engine_id uuid NOT NULL,
    user_id uuid NOT NULL,
    CONSTRAINT chat_agents_language_check CHECK (((language)::text = ANY ((ARRAY['BENGALI'::character varying, 'GERMAN'::character varying, 'ENGLISH'::character varying, 'SPANISH'::character varying, 'FRENCH'::character varying, 'GUJARATI'::character varying, 'HINDI'::character varying, 'ITALIAN'::character varying, 'JAPANESE'::character varying, 'KANNADA'::character varying, 'KOREAN'::character varying, 'MALAYALAM'::character varying, 'MARATHI'::character varying, 'PUNJABI'::character varying, 'PORTUGUESE'::character varying, 'TAMIL'::character varying, 'TELUGU'::character varying, 'CHINESE'::character varying])::text[])))
);


ALTER TABLE public.chat_agents OWNER TO reacherr_db_user;

--
-- Name: kb_files; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.kb_files (
    id uuid NOT NULL,
    source_id uuid NOT NULL,
    filename character varying(255) NOT NULL,
    s3_key character varying(255) NOT NULL
);


ALTER TABLE public.kb_files OWNER TO reacherr_db_user;

--
-- Name: kb_sources; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.kb_sources (
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    id uuid NOT NULL,
    kb_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    CONSTRAINT kb_sources_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'READY'::character varying, 'FAILED'::character varying])::text[]))),
    CONSTRAINT kb_sources_type_check CHECK (((type)::text = ANY ((ARRAY['FILE'::character varying, 'TEXT'::character varying, 'URL'::character varying])::text[])))
);


ALTER TABLE public.kb_sources OWNER TO reacherr_db_user;

--
-- Name: kb_texts; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.kb_texts (
    id uuid NOT NULL,
    source_id uuid NOT NULL,
    s3_key character varying(255) NOT NULL,
    title character varying(255) NOT NULL
);


ALTER TABLE public.kb_texts OWNER TO reacherr_db_user;

--
-- Name: kb_urls; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.kb_urls (
    id uuid NOT NULL,
    source_id uuid NOT NULL,
    s3_key character varying(255) NOT NULL,
    url character varying(255) NOT NULL
);


ALTER TABLE public.kb_urls OWNER TO reacherr_db_user;

--
-- Name: knowledge_bases; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.knowledge_bases (
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    ingestion_job_id character varying(255),
    name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT knowledge_bases_status_check CHECK (((status)::text = ANY ((ARRAY['CREATING'::character varying, 'COMPLETE'::character varying, 'FAILED'::character varying, 'DELETING'::character varying])::text[])))
);


ALTER TABLE public.knowledge_bases OWNER TO reacherr_db_user;

--
-- Name: otp; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.otp (
    used boolean NOT NULL,
    expires_at timestamp(6) with time zone,
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    target character varying(255) NOT NULL,
    type character varying(255),
    CONSTRAINT otp_type_check CHECK (((type)::text = ANY ((ARRAY['EMAIL'::character varying, 'PHONE'::character varying])::text[])))
);


ALTER TABLE public.otp OWNER TO reacherr_db_user;

--
-- Name: otp_id_seq; Type: SEQUENCE; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE public.otp ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.otp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: phone_numbers; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.phone_numbers (
    area_code integer,
    country_code smallint,
    is_toll_free boolean,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    inbound_agent_id uuid,
    outbound_agent_id uuid,
    user_id uuid NOT NULL,
    phone_number character varying(20) NOT NULL,
    nickname character varying(50),
    auth_password character varying(255),
    auth_username character varying(255),
    inbound_webhook_url character varying(255),
    livekit_inbound_trunk_id character varying(255) NOT NULL,
    lk_dispatch_rule_id character varying(255) NOT NULL,
    outbound_sip_trunk character varying(255) NOT NULL,
    phone_number_type character varying(255) NOT NULL,
    provider_resource_id character varying(255),
    termination_uri character varying(255) NOT NULL,
    transport_type character varying(255),
    twilio_phone_sid character varying(255),
    allowed_inbound_country smallint[],
    allowed_outbound_country smallint[],
    CONSTRAINT phone_numbers_country_code_check CHECK (((country_code >= 0) AND (country_code <= 4))),
    CONSTRAINT phone_numbers_phone_number_type_check CHECK (((phone_number_type)::text = ANY ((ARRAY['TWILIO'::character varying, 'CUSTOM'::character varying, 'TELNYX'::character varying, 'PLIVO'::character varying])::text[]))),
    CONSTRAINT phone_numbers_transport_type_check CHECK (((transport_type)::text = ANY ((ARRAY['UDP'::character varying, 'TCP'::character varying, 'TLS'::character varying, 'AUTO'::character varying])::text[])))
);


ALTER TABLE public.phone_numbers OWNER TO reacherr_db_user;

--
-- Name: reacherr_llm; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.reacherr_llm (
    begin_message character varying(255),
    begin_message_delay integer,
    created_at timestamp(6) with time zone NOT NULL,
    default_dynamic_variables jsonb,
    general_prompt character varying(255),
    general_tools jsonb,
    kb_config jsonb,
    knowledge_base_ids character varying(255)[],
    last_updated_at timestamp(6) with time zone NOT NULL,
    mcps jsonb,
    start_speaker character varying(255),
    starting_state character varying(255),
    states jsonb,
    temperature double precision,
    tool_call_strict_mode boolean,
    id uuid NOT NULL,
    user_id uuid,
    CONSTRAINT reacherr_llm_start_speaker_check CHECK (((start_speaker)::text = ANY ((ARRAY['USER'::character varying, 'AGENT'::character varying])::text[])))
);


ALTER TABLE public.reacherr_llm OWNER TO reacherr_db_user;

--
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.refresh_token (
    expiry_date timestamp(6) with time zone NOT NULL,
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL
);


ALTER TABLE public.refresh_token OWNER TO reacherr_db_user;

--
-- Name: refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE public.refresh_token ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: response_engines; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.response_engines (
    type character varying(31) NOT NULL,
    id uuid NOT NULL,
    user_id uuid,
    CONSTRAINT response_engines_type_check CHECK (((type)::text = 'REACHERR_LLM'::text))
);


ALTER TABLE public.response_engines OWNER TO reacherr_db_user;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.user_roles (
    user_user_id uuid NOT NULL,
    roles character varying(255),
    CONSTRAINT user_roles_roles_check CHECK (((roles)::text = ANY ((ARRAY['OWNER'::character varying, 'MEMBER'::character varying, 'VIEWER'::character varying])::text[])))
);


ALTER TABLE public.user_roles OWNER TO reacherr_db_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.users (
    email_verified boolean NOT NULL,
    enabled boolean NOT NULL,
    phone_verified boolean NOT NULL,
    user_id uuid NOT NULL,
    username character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    password character varying(255),
    phone_number character varying(255),
    provider_id character varying(255),
    provider_type character varying(255),
    CONSTRAINT users_provider_type_check CHECK (((provider_type)::text = ANY ((ARRAY['EMAIL'::character varying, 'GOOGLE'::character varying, 'GITHUB'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO reacherr_db_user;

--
-- Name: voice_agents; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.voice_agents (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    allow_user_dtmf boolean,
    ambient_sound character varying(255),
    ambient_sound_volume double precision,
    analysis_successful_prompt character varying(255),
    analysis_summary_prompt character varying(255),
    begin_message_delay integer,
    boosted_key_words character varying(255)[],
    created_at timestamp(6) with time zone NOT NULL,
    data_storage_setting character varying(255),
    enable_voice_mail_detection boolean,
    end_call_after_silence_ms integer,
    fall_back_voice_ids character varying(255)[],
    guardrail_config jsonb,
    interruption_sensitivity double precision,
    ivr_option jsonb,
    language_enum character varying(255),
    last_updated_at timestamp(6) with time zone NOT NULL,
    max_call_duration_ms integer,
    pii_config jsonb,
    post_call_analysis_data jsonb,
    post_call_analysis_model character varying(255),
    provider character varying(255),
    provider_voice_id character varying(255),
    reminder_max_count integer,
    reminder_trigger_timeout_ms integer,
    responsiveness double precision,
    ring_time_out_ms integer,
    stt_provider character varying(255),
    user_dtmf_option jsonb,
    voice_emotion character varying(255),
    voice_id character varying(255) NOT NULL,
    voice_mail_detection_time_out_ms integer,
    voice_mail_message character varying(255),
    voice_mail_option jsonb,
    voice_model character varying(255),
    voice_speed double precision,
    voice_temperature double precision,
    volume double precision,
    webhook_event character varying(255),
    webhook_timeout_ms integer,
    webhook_url character varying(255),
    response_engine_id uuid NOT NULL,
    user_id uuid NOT NULL,
    enable_voicemail_detection boolean,
    no_response_timeout_ms integer,
    ring_timeout_ms integer,
    stt_config jsonb,
    tts_config jsonb,
    user_dtmf_options jsonb,
    version_description character varying(255),
    voicemail_option jsonb,
    CONSTRAINT voice_agents_ambient_sound_check CHECK (((ambient_sound)::text = ANY ((ARRAY['COFFEE_SHOP'::character varying, 'CONVENTION_HALL'::character varying, 'SUMMER_OUTDOOR'::character varying, 'MOUNTAIN_OUTDOOR'::character varying, 'STATIC_NOISE'::character varying, 'CALL_CENTER'::character varying])::text[]))),
    CONSTRAINT voice_agents_data_storage_setting_check CHECK (((data_storage_setting)::text = ANY ((ARRAY['EVERYTHING'::character varying, 'EVERYTHING_EXCEPT_PII'::character varying, 'BASIC_ATTRIBUTES_ONLY'::character varying])::text[]))),
    CONSTRAINT voice_agents_language_enum_check CHECK (((language_enum)::text = ANY ((ARRAY['BENGALI'::character varying, 'GERMAN'::character varying, 'ENGLISH'::character varying, 'SPANISH'::character varying, 'FRENCH'::character varying, 'GUJARATI'::character varying, 'HINDI'::character varying, 'ITALIAN'::character varying, 'JAPANESE'::character varying, 'KANNADA'::character varying, 'KOREAN'::character varying, 'MALAYALAM'::character varying, 'MARATHI'::character varying, 'PUNJABI'::character varying, 'PORTUGUESE'::character varying, 'TAMIL'::character varying, 'TELUGU'::character varying, 'CHINESE'::character varying])::text[]))),
    CONSTRAINT voice_agents_post_call_analysis_model_check CHECK (((post_call_analysis_model)::text = ANY ((ARRAY['GPT_4_1'::character varying, 'GPT_4_1_MINI'::character varying, 'GPT_4_1_NANO'::character varying, 'GPT_5'::character varying, 'GPT_5_1'::character varying, 'GPT_5_2'::character varying, 'GPT_5_MINI'::character varying, 'GPT_5_NANO'::character varying, 'CLAUDE_4_5_SONNET'::character varying, 'CLAUDE_4_5_HAIKU'::character varying, 'GEMINI_2_5_FLASH'::character varying, 'GEMINI_2_5_FLASH_LITE'::character varying, 'GEMINI_3_0_FLASH'::character varying])::text[]))),
    CONSTRAINT voice_agents_provider_check CHECK (((provider)::text = ANY ((ARRAY['ELEVENLABS'::character varying, 'CARTESIA'::character varying, 'MINIMAX'::character varying, 'OPENAI'::character varying, 'SARVAM'::character varying])::text[]))),
    CONSTRAINT voice_agents_stt_provider_check CHECK (((stt_provider)::text = ANY ((ARRAY['DEEPGRAM'::character varying, 'SARVAM'::character varying])::text[]))),
    CONSTRAINT voice_agents_voice_emotion_check CHECK (((voice_emotion)::text = ANY ((ARRAY['CALM'::character varying, 'SYMPATHETIC'::character varying, 'HAPPY'::character varying, 'SAD'::character varying, 'ANGRY'::character varying, 'FEARFUL'::character varying, 'SURPRISED'::character varying])::text[]))),
    CONSTRAINT voice_agents_voice_model_check CHECK (((voice_model)::text = ANY ((ARRAY['ELEVEN_TURBO_V2'::character varying, 'ELEVEN_FLASH_V2'::character varying, 'ELEVEN_TURBO_V2_5'::character varying, 'ELEVEN_FLASH_V2_5'::character varying, 'ELEVEN_MULTILINGUAL_V2'::character varying, 'SONIC_3'::character varying, 'SONIC_TURBO'::character varying, 'OPENAI_TTS_1'::character varying, 'MINIMAX_T2A_V1'::character varying])::text[]))),
    CONSTRAINT voice_agents_webhook_event_check CHECK (((webhook_event)::text = ANY ((ARRAY['CALL_STARTED'::character varying, 'CALL_ENDED'::character varying, 'CALL_ANALYZED'::character varying, 'TRANSCRIPT_UPDATED'::character varying, 'TRANSFER_STARTED'::character varying, 'TRANSFER_BRIDGED'::character varying, 'TRANSFER_CANCELLED'::character varying, 'TRANSFER_ENDED'::character varying])::text[])))
);


ALTER TABLE public.voice_agents OWNER TO reacherr_db_user;

--
-- Name: voices; Type: TABLE; Schema: public; Owner: reacherr_db_user
--

CREATE TABLE public.voices (
    id uuid NOT NULL,
    accent character varying(255),
    age character varying(255),
    avatar_url character varying(255),
    capabilities jsonb,
    default_model character varying(255),
    gender character varying(255),
    name character varying(255) NOT NULL,
    preview_audio_url character varying(255),
    provider character varying(255) NOT NULL,
    provider_voice_id character varying(255) NOT NULL,
    recommended boolean NOT NULL,
    supported_languages jsonb,
    voice_id character varying(255) NOT NULL,
    owner_id uuid,
    CONSTRAINT voices_default_model_check CHECK (((default_model)::text = ANY ((ARRAY['ELEVEN_TURBO_V2'::character varying, 'ELEVEN_FLASH_V2'::character varying, 'ELEVEN_TURBO_V2_5'::character varying, 'ELEVEN_FLASH_V2_5'::character varying, 'ELEVEN_MULTILINGUAL_V2'::character varying, 'SONIC_3'::character varying, 'SONIC_TURBO'::character varying, 'OPENAI_TTS_1'::character varying, 'MINIMAX_T2A_V1'::character varying])::text[]))),
    CONSTRAINT voices_provider_check CHECK (((provider)::text = ANY ((ARRAY['ELEVENLABS'::character varying, 'CARTESIA'::character varying, 'MINIMAX'::character varying, 'OPENAI'::character varying, 'SARVAM'::character varying])::text[])))
);


ALTER TABLE public.voices OWNER TO reacherr_db_user;

--
-- Name: agent_templates agent_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.agent_templates
    ADD CONSTRAINT agent_templates_pkey PRIMARY KEY (id);


--
-- Name: chat_agents chat_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT chat_agents_pkey PRIMARY KEY (id);


--
-- Name: kb_files kb_files_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_files
    ADD CONSTRAINT kb_files_pkey PRIMARY KEY (id);


--
-- Name: kb_files kb_files_source_id_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_files
    ADD CONSTRAINT kb_files_source_id_key UNIQUE (source_id);


--
-- Name: kb_sources kb_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_sources
    ADD CONSTRAINT kb_sources_pkey PRIMARY KEY (id);


--
-- Name: kb_texts kb_texts_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_texts
    ADD CONSTRAINT kb_texts_pkey PRIMARY KEY (id);


--
-- Name: kb_texts kb_texts_source_id_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_texts
    ADD CONSTRAINT kb_texts_source_id_key UNIQUE (source_id);


--
-- Name: kb_urls kb_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_urls
    ADD CONSTRAINT kb_urls_pkey PRIMARY KEY (id);


--
-- Name: kb_urls kb_urls_source_id_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_urls
    ADD CONSTRAINT kb_urls_source_id_key UNIQUE (source_id);


--
-- Name: knowledge_bases knowledge_bases_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.knowledge_bases
    ADD CONSTRAINT knowledge_bases_pkey PRIMARY KEY (id);


--
-- Name: otp otp_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.otp
    ADD CONSTRAINT otp_pkey PRIMARY KEY (id);


--
-- Name: phone_numbers phone_numbers_inbound_agent_id_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_inbound_agent_id_key UNIQUE (inbound_agent_id);


--
-- Name: phone_numbers phone_numbers_outbound_agent_id_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_outbound_agent_id_key UNIQUE (outbound_agent_id);


--
-- Name: phone_numbers phone_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_pkey PRIMARY KEY (phone_number);


--
-- Name: reacherr_llm reacherr_llm_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.reacherr_llm
    ADD CONSTRAINT reacherr_llm_pkey PRIMARY KEY (id);


--
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- Name: refresh_token refresh_token_token_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_token_key UNIQUE (token);


--
-- Name: refresh_token refresh_token_user_id_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_user_id_key UNIQUE (user_id);


--
-- Name: response_engines response_engines_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.response_engines
    ADD CONSTRAINT response_engines_pkey PRIMARY KEY (id);


--
-- Name: voices uk514qmqc7jfh4scy58fqiuo1a2; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.voices
    ADD CONSTRAINT uk514qmqc7jfh4scy58fqiuo1a2 UNIQUE (voice_id);


--
-- Name: users ukr43af9ap4edm43mmtq01oddj6; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT ukr43af9ap4edm43mmtq01oddj6 UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: voice_agents voice_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.voice_agents
    ADD CONSTRAINT voice_agents_pkey PRIMARY KEY (id);


--
-- Name: voices voices_pkey; Type: CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.voices
    ADD CONSTRAINT voices_pkey PRIMARY KEY (id);


--
-- Name: idx_otp_target_type_code_valid; Type: INDEX; Schema: public; Owner: reacherr_db_user
--

CREATE INDEX idx_otp_target_type_code_valid ON public.otp USING btree (target, type, code, used, expires_at);


--
-- Name: idx_phone_number_user_id; Type: INDEX; Schema: public; Owner: reacherr_db_user
--

CREATE INDEX idx_phone_number_user_id ON public.phone_numbers USING btree (user_id);


--
-- Name: idx_voice_owner; Type: INDEX; Schema: public; Owner: reacherr_db_user
--

CREATE INDEX idx_voice_owner ON public.voices USING btree (owner_id);


--
-- Name: idx_voice_slug; Type: INDEX; Schema: public; Owner: reacherr_db_user
--

CREATE INDEX idx_voice_slug ON public.voices USING btree (voice_id);


--
-- Name: chat_agents fk18fmkfmypu1pynmpck9s2ic4y; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT fk18fmkfmypu1pynmpck9s2ic4y FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: knowledge_bases fk2py2gvfth0eq9l8fdb96989bu; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.knowledge_bases
    ADD CONSTRAINT fk2py2gvfth0eq9l8fdb96989bu FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_roles fk5gikiw021w6y16a8t5vjwqwyj; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk5gikiw021w6y16a8t5vjwqwyj FOREIGN KEY (user_user_id) REFERENCES public.users(user_id);


--
-- Name: reacherr_llm fk5m6l3rlf5390bhev6g4grfh8p; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.reacherr_llm
    ADD CONSTRAINT fk5m6l3rlf5390bhev6g4grfh8p FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: voice_agents fk79a6bx6sxmpki6dioyrj2qt8o; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.voice_agents
    ADD CONSTRAINT fk79a6bx6sxmpki6dioyrj2qt8o FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: chat_agents fkbfmrguin9o6s5rf00cumibrs9; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.chat_agents
    ADD CONSTRAINT fkbfmrguin9o6s5rf00cumibrs9 FOREIGN KEY (response_engine_id) REFERENCES public.response_engines(id);


--
-- Name: voices fkc311m3t2je89912jmdmo3yxr4; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.voices
    ADD CONSTRAINT fkc311m3t2je89912jmdmo3yxr4 FOREIGN KEY (owner_id) REFERENCES public.users(user_id);


--
-- Name: kb_texts fkcs6e66x4qephfjt6tuohh77ej; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_texts
    ADD CONSTRAINT fkcs6e66x4qephfjt6tuohh77ej FOREIGN KEY (source_id) REFERENCES public.kb_sources(id);


--
-- Name: reacherr_llm fkdoy9g821dj87n76u8ajus7n0u; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.reacherr_llm
    ADD CONSTRAINT fkdoy9g821dj87n76u8ajus7n0u FOREIGN KEY (id) REFERENCES public.response_engines(id);


--
-- Name: phone_numbers fkf9xtwjylin8fllhorblshxvd3; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fkf9xtwjylin8fllhorblshxvd3 FOREIGN KEY (outbound_agent_id) REFERENCES public.voice_agents(id);


--
-- Name: phone_numbers fkg077extnnxwv904qjw2kwinpg; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fkg077extnnxwv904qjw2kwinpg FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: voice_agents fkhmr8obro2og81rsvi00r9j4kr; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.voice_agents
    ADD CONSTRAINT fkhmr8obro2og81rsvi00r9j4kr FOREIGN KEY (response_engine_id) REFERENCES public.response_engines(id);


--
-- Name: refresh_token fkjtx87i0jvq2svedphegvdwcuy; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT fkjtx87i0jvq2svedphegvdwcuy FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: response_engines fkk5q8bhf4yvgls05cvcj3wp3vl; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.response_engines
    ADD CONSTRAINT fkk5q8bhf4yvgls05cvcj3wp3vl FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: kb_sources fkkf6n68ik4c56ki9e00h2r9jf5; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_sources
    ADD CONSTRAINT fkkf6n68ik4c56ki9e00h2r9jf5 FOREIGN KEY (kb_id) REFERENCES public.knowledge_bases(id);


--
-- Name: kb_urls fkkuki9ojx2tt2xdh6qj9jnes4a; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_urls
    ADD CONSTRAINT fkkuki9ojx2tt2xdh6qj9jnes4a FOREIGN KEY (source_id) REFERENCES public.kb_sources(id);


--
-- Name: phone_numbers fkm531dirskfu3l5ggkuib18oe9; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT fkm531dirskfu3l5ggkuib18oe9 FOREIGN KEY (inbound_agent_id) REFERENCES public.voice_agents(id);


--
-- Name: kb_files fkql92p9s4jwxv3yxrbyyqs3a0u; Type: FK CONSTRAINT; Schema: public; Owner: reacherr_db_user
--

ALTER TABLE ONLY public.kb_files
    ADD CONSTRAINT fkql92p9s4jwxv3yxrbyyqs3a0u FOREIGN KEY (source_id) REFERENCES public.kb_sources(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO reacherr_db_user;


--
-- PostgreSQL database dump complete
--

\unrestrict ms3Jrd7JpyJt4UmEA6askYdx1VgrsnOBkBwCtubxuWDJzQRCc4wM5QYLhbtFqqy

zsh: command not found: Password:
apoorvjain@apoorvs-MacBook-Air ~ % 
