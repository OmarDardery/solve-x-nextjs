--
-- PostgreSQL database dump
--

\restrict GRpGdg94pQZemZBUbIKYKCYaG2FpAabbdW8xBKc0f1aQegOm8b0n3UuEyS9mxTO

-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.1

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
-- Name: applications; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.applications (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    student_id bigint NOT NULL,
    opportunity_id bigint NOT NULL,
    message text,
    resume_link text,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public.applications OWNER TO prisma_migration;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO prisma_migration;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: coins; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.coins (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    amount bigint NOT NULL,
    student_id bigint NOT NULL
);


ALTER TABLE public.coins OWNER TO prisma_migration;

--
-- Name: coins_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.coins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coins_id_seq OWNER TO prisma_migration;

--
-- Name: coins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.coins_id_seq OWNED BY public.coins.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    title text,
    description text,
    date text,
    link text,
    sign_up_link text,
    organization_id bigint
);


ALTER TABLE public.events OWNER TO prisma_migration;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO prisma_migration;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    recipient_id bigint NOT NULL,
    recipient_role text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    read boolean DEFAULT false,
    read_at timestamp(6) with time zone
);


ALTER TABLE public.notifications OWNER TO prisma_migration;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO prisma_migration;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.opportunities (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    professor_id bigint NOT NULL,
    name text NOT NULL,
    details text,
    requirements text,
    reward text,
    type text NOT NULL
);


ALTER TABLE public.opportunities OWNER TO prisma_migration;

--
-- Name: opportunities_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.opportunities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunities_id_seq OWNER TO prisma_migration;

--
-- Name: opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.opportunities_id_seq OWNED BY public.opportunities.id;


--
-- Name: opportunity_tags; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.opportunity_tags (
    opportunity_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.opportunity_tags OWNER TO prisma_migration;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.organizations (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    name text,
    email text,
    password text,
    contact text,
    link text,
    last_changed_password timestamp(6) with time zone
);


ALTER TABLE public.organizations OWNER TO prisma_migration;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO prisma_migration;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: professors; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.professors (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    first_name text,
    last_name text,
    email text,
    password text,
    last_changed_password timestamp(6) with time zone
);


ALTER TABLE public.professors OWNER TO prisma_migration;

--
-- Name: professors_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.professors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professors_id_seq OWNER TO prisma_migration;

--
-- Name: professors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.professors_id_seq OWNED BY public.professors.id;


--
-- Name: student_tags; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.student_tags (
    student_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.student_tags OWNER TO prisma_migration;

--
-- Name: students; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.students (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    first_name text,
    last_name text,
    email text,
    password text,
    last_changed_password timestamp(6) with time zone
);


ALTER TABLE public.students OWNER TO prisma_migration;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO prisma_migration;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    name text NOT NULL,
    description text
);


ALTER TABLE public.tags OWNER TO prisma_migration;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO prisma_migration;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: weekly_reports; Type: TABLE; Schema: public; Owner: prisma_migration
--

CREATE TABLE public.weekly_reports (
    id bigint NOT NULL,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone,
    deleted_at timestamp(6) with time zone,
    student_id bigint NOT NULL,
    recipient_id bigint NOT NULL,
    drive_link text NOT NULL
);


ALTER TABLE public.weekly_reports OWNER TO prisma_migration;

--
-- Name: weekly_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: prisma_migration
--

CREATE SEQUENCE public.weekly_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weekly_reports_id_seq OWNER TO prisma_migration;

--
-- Name: weekly_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: prisma_migration
--

ALTER SEQUENCE public.weekly_reports_id_seq OWNED BY public.weekly_reports.id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: coins id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.coins ALTER COLUMN id SET DEFAULT nextval('public.coins_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: opportunities id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.opportunities ALTER COLUMN id SET DEFAULT nextval('public.opportunities_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: professors id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.professors ALTER COLUMN id SET DEFAULT nextval('public.professors_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: weekly_reports id; Type: DEFAULT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.weekly_reports ALTER COLUMN id SET DEFAULT nextval('public.weekly_reports_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.applications (id, created_at, updated_at, deleted_at, student_id, opportunity_id, message, resume_link, status) FROM stdin;
1	\N	2026-02-24 15:06:45.463+00	\N	1	1	I WANT IT PLEASEEE	https://drive.google.com/file/d/1vaTqLe3g_yhR3BLQhlRsshofoui29EGh/view?usp=drive_link	accepted
2	\N	2026-02-24 15:11:45.396+00	\N	1	2	xkjwbchjewvc 	https://drive.google.com/file/d/1vaTqLe3g_yhR3BLQhlRsshofoui29EGh/view	pending
\.


--
-- Data for Name: coins; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.coins (id, created_at, updated_at, deleted_at, amount, student_id) FROM stdin;
1	\N	2026-02-23 20:38:41.072+00	\N	0	1
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.events (id, created_at, updated_at, deleted_at, title, description, date, link, sign_up_link, organization_id) FROM stdin;
1	\N	2026-02-24 17:05:14.297+00	\N	engineerexxx	hehehe	august 7th-10th	www.facebook.com	https://www.udemy.com/	1
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.notifications (id, created_at, updated_at, deleted_at, recipient_id, recipient_role, title, message, type, read, read_at) FROM stdin;
1	\N	2026-02-24 15:12:08.972+00	\N	1	student	🎉 Application Accepted!	Your application for 'workkk' has been accepted	success	t	2026-02-24 15:12:08.969+00
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.opportunities (id, created_at, updated_at, deleted_at, professor_id, name, details, requirements, reward, type) FROM stdin;
1	\N	2026-02-24 13:23:27.918+00	\N	1	workkk	mememememmeme	hard worker	cert	project
2	\N	2026-02-24 15:10:30.329+00	\N	1	idk	knwxkjw xj	wxnkwkxjewx	wx nw	research
\.


--
-- Data for Name: opportunity_tags; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.opportunity_tags (opportunity_id, tag_id) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.organizations (id, created_at, updated_at, deleted_at, name, email, password, contact, link, last_changed_password) FROM stdin;
1	\N	2026-02-24 16:30:38.378+00	\N	hehe	omar71creatorcodefortnite@gmail.com	$2b$14$dHQkLgcQ4Wx7gUkGhH2Bd.ym8w7yp3b70At6kkwEkITCo434IXu5e	\N	www.google.com	2026-02-24 16:30:38.371+00
\.


--
-- Data for Name: professors; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.professors (id, created_at, updated_at, deleted_at, first_name, last_name, email, password, last_changed_password) FROM stdin;
1	\N	2026-02-24 13:17:31.331+00	\N	Omar	Ahmed	oay782006@gmail.com	$2b$14$ObPqAE4UOp20RzuqDb3lMeY21E1vZdRFRi1eRft0QLiBPuHjyFYX2	2026-02-24 13:17:31.319+00
2	\N	2026-02-27 11:33:48.646+00	\N	omar	hehe	tv71genshin@gmail.com	$2b$14$XbswpQBhb18zpuxZr4rSb.cZrwSuUYX5znHia0fpd03Hz4hGgp/lG	2026-02-27 11:33:48.633+00
\.


--
-- Data for Name: student_tags; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.student_tags (student_id, tag_id) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.students (id, created_at, updated_at, deleted_at, first_name, last_name, email, password, last_changed_password) FROM stdin;
1	\N	2026-02-23 20:38:40.883+00	\N	Omar	Ahmed	23-101265@students.eui.edu.eg	$2b$14$oAtpwqtqvP3oDRFoCdo4xOoKT8ihUu5StKz.5hccbDE0gTPgE0XLm	2026-02-23 20:38:40.874+00
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.tags (id, created_at, updated_at, deleted_at, name, description) FROM stdin;
\.


--
-- Data for Name: weekly_reports; Type: TABLE DATA; Schema: public; Owner: prisma_migration
--

COPY public.weekly_reports (id, created_at, updated_at, deleted_at, student_id, recipient_id, drive_link) FROM stdin;
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.applications_id_seq', 2, true);


--
-- Name: coins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.coins_id_seq', 1, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.events_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, true);


--
-- Name: opportunities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.opportunities_id_seq', 2, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.organizations_id_seq', 1, true);


--
-- Name: professors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.professors_id_seq', 2, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.students_id_seq', 1, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: prisma_migration
--

SELECT pg_catalog.setval('public.weekly_reports_id_seq', 1, false);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: coins coins_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.coins
    ADD CONSTRAINT coins_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: opportunity_tags opportunity_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.opportunity_tags
    ADD CONSTRAINT opportunity_tags_pkey PRIMARY KEY (opportunity_id, tag_id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: professors professors_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.professors
    ADD CONSTRAINT professors_pkey PRIMARY KEY (id);


--
-- Name: student_tags student_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.student_tags
    ADD CONSTRAINT student_tags_pkey PRIMARY KEY (student_id, tag_id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: weekly_reports weekly_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_pkey PRIMARY KEY (id);


--
-- Name: idx_applications_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_applications_deleted_at ON public.applications USING btree (deleted_at);


--
-- Name: idx_coins_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_coins_deleted_at ON public.coins USING btree (deleted_at);


--
-- Name: idx_coins_student_id; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX idx_coins_student_id ON public.coins USING btree (student_id);


--
-- Name: idx_events_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_events_deleted_at ON public.events USING btree (deleted_at);


--
-- Name: idx_notifications_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_notifications_deleted_at ON public.notifications USING btree (deleted_at);


--
-- Name: idx_opportunities_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_opportunities_deleted_at ON public.opportunities USING btree (deleted_at);


--
-- Name: idx_organizations_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_organizations_deleted_at ON public.organizations USING btree (deleted_at);


--
-- Name: idx_professors_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_professors_deleted_at ON public.professors USING btree (deleted_at);


--
-- Name: idx_students_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_students_deleted_at ON public.students USING btree (deleted_at);


--
-- Name: idx_tags_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_tags_deleted_at ON public.tags USING btree (deleted_at);


--
-- Name: idx_weekly_reports_deleted_at; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE INDEX idx_weekly_reports_deleted_at ON public.weekly_reports USING btree (deleted_at);


--
-- Name: uni_organizations_email; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX uni_organizations_email ON public.organizations USING btree (email);


--
-- Name: uni_professors_email; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX uni_professors_email ON public.professors USING btree (email);


--
-- Name: uni_students_email; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX uni_students_email ON public.students USING btree (email);


--
-- Name: uni_tags_name; Type: INDEX; Schema: public; Owner: prisma_migration
--

CREATE UNIQUE INDEX uni_tags_name ON public.tags USING btree (name);


--
-- Name: applications fk_applications_opportunity; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_opportunity FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications fk_applications_student; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: events fk_events_organization; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_events_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: opportunities fk_opportunities_professor; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT fk_opportunities_professor FOREIGN KEY (professor_id) REFERENCES public.professors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: opportunity_tags fk_opportunity_tags_opportunity; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.opportunity_tags
    ADD CONSTRAINT fk_opportunity_tags_opportunity FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: opportunity_tags fk_opportunity_tags_tag; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.opportunity_tags
    ADD CONSTRAINT fk_opportunity_tags_tag FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_tags fk_student_tags_student; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.student_tags
    ADD CONSTRAINT fk_student_tags_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_tags fk_student_tags_tag; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.student_tags
    ADD CONSTRAINT fk_student_tags_tag FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coins fk_students_coins; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.coins
    ADD CONSTRAINT fk_students_coins FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: weekly_reports fk_weekly_reports_recipient; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT fk_weekly_reports_recipient FOREIGN KEY (recipient_id) REFERENCES public.professors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: weekly_reports fk_weekly_reports_student; Type: FK CONSTRAINT; Schema: public; Owner: prisma_migration
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT fk_weekly_reports_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GRpGdg94pQZemZBUbIKYKCYaG2FpAabbdW8xBKc0f1aQegOm8b0n3UuEyS9mxTO

