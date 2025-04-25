--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

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

--
-- Name: enum_Orders_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered'
);


ALTER TYPE public."enum_Orders_status" OWNER TO postgres;

--
-- Name: enum_Roles_accounts; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Roles_accounts" AS ENUM (
    'read',
    'manage',
    'delete',
    'none'
);


ALTER TYPE public."enum_Roles_accounts" OWNER TO postgres;

--
-- Name: enum_Roles_finance; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Roles_finance" AS ENUM (
    'read',
    'manage',
    'delete',
    'none'
);


ALTER TYPE public."enum_Roles_finance" OWNER TO postgres;

--
-- Name: enum_Roles_orders; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Roles_orders" AS ENUM (
    'read',
    'manage',
    'delete',
    'none'
);


ALTER TYPE public."enum_Roles_orders" OWNER TO postgres;

--
-- Name: enum_Roles_stocks; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Roles_stocks" AS ENUM (
    'read',
    'manage',
    'delete',
    'none'
);


ALTER TYPE public."enum_Roles_stocks" OWNER TO postgres;

--
-- Name: enum_Roles_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Roles_type" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE public."enum_Roles_type" OWNER TO postgres;

--
-- Name: enum_product_quotes_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_product_quotes_status AS ENUM (
    'pending',
    'contacted',
    'completed',
    'rejected'
);


ALTER TYPE public.enum_product_quotes_status OWNER TO postgres;

--
-- Name: enum_product_reviews_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_product_reviews_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.enum_product_reviews_status OWNER TO postgres;

--
-- Name: enum_purchases_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_purchases_status AS ENUM (
    'pending',
    'completed',
    'cancelled'
);


ALTER TYPE public.enum_purchases_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "isActive" boolean DEFAULT true,
    "lastLogin" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id uuid NOT NULL,
    "isDefault" boolean DEFAULT false,
    "accountId" uuid NOT NULL,
    type character varying(255) NOT NULL,
    "phoneNumber" character varying(255),
    street character varying(255) NOT NULL,
    country character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    "postalCode" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attributes (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.attributes OWNER TO postgres;

--
-- Name: catalogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.catalogs (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    images character varying(255)[],
    "userId" uuid NOT NULL,
    status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    description text,
    "productCount" integer DEFAULT 0
);


ALTER TABLE public.catalogs OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    "catalogId" uuid NOT NULL,
    name character varying(255),
    slug character varying(255),
    images character varying(255)[],
    "userId" uuid NOT NULL,
    status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    description text,
    "productCount" integer DEFAULT 0
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: gallery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery (
    id uuid NOT NULL,
    type character varying(255) NOT NULL,
    image character varying(255) NOT NULL,
    status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.gallery OWNER TO postgres;

--
-- Name: order_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_history (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    status character varying(255) NOT NULL,
    note text,
    "performerInfo" jsonb DEFAULT '{}'::jsonb,
    "performedBy" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.order_history OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "productSnapshot" jsonb NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    "orderNumber" character varying(255) NOT NULL,
    "accountId" uuid NOT NULL,
    website character varying(255) NOT NULL,
    "shippingAddressSnapshot" jsonb NOT NULL,
    "billingAddressSnapshot" jsonb NOT NULL,
    currency character varying(255) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT 0,
    tax numeric(10,2) DEFAULT 0,
    discount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "paymentStatus" character varying(255) DEFAULT 'unpaid'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    items jsonb NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    "transactionId" character varying(255),
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(255) NOT NULL,
    method character varying(255) NOT NULL,
    "gatewayResponse" jsonb,
    "refundedAmount" numeric(10,2) DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    stocks character varying(255)[],
    orders character varying(255)[],
    finance character varying(255)[],
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    purchase character varying(255)[],
    setting character varying(255)[]
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attributes (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    "attributeId" uuid NOT NULL,
    value character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.product_attributes OWNER TO postgres;

--
-- Name: product_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_codes (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.product_codes OWNER TO postgres;

--
-- Name: product_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_pricing (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    currency character varying(255) NOT NULL,
    "discountType" character varying(255),
    "discountValue" numeric(12,2),
    "basePrice" numeric(12,2) NOT NULL,
    "finalPrice" numeric(12,2),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.product_pricing OWNER TO postgres;

--
-- Name: product_quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_quotes (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    message text NOT NULL,
    "productId" uuid NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.product_quotes OWNER TO postgres;

--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_reviews (
    id uuid NOT NULL,
    rating character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    title character varying(255),
    content text NOT NULL,
    "productId" uuid NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.product_reviews OWNER TO postgres;

--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tags (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description character varying(255),
    image character varying(255) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.product_tags OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    sku character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    images character varying(255)[],
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "inStock" integer DEFAULT 0,
    "catalogId" uuid,
    "catId" uuid,
    "subCategoryId" uuid,
    "websiteId" uuid[] DEFAULT ARRAY[]::uuid[],
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    "saleStock" integer DEFAULT 0,
    "productCode" uuid,
    tags character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[]
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: COLUMN products.images; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products.images IS 'Array of product image URLs';


--
-- Name: COLUMN products."inStock"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products."inStock" IS 'Stock available for sale';


--
-- Name: COLUMN products."websiteId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products."websiteId" IS 'Array of website IDs where product is published';


--
-- Name: COLUMN products.tags; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products.tags IS 'Array of tags';


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id uuid NOT NULL,
    currency character varying(255) NOT NULL,
    quantity integer NOT NULL,
    "costPrice" numeric(12,2) NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying,
    "vendorId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    token character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(255),
    slug character varying(255),
    permissions json NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: subCategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."subCategories" (
    id uuid NOT NULL,
    "catId" uuid NOT NULL,
    name character varying(255),
    slug character varying(255),
    images character varying(255)[],
    "userId" uuid NOT NULL,
    status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    description text,
    "productCount" integer DEFAULT 0
);


ALTER TABLE public."subCategories" OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    "firstName" character varying(255),
    "lastName" character varying(255),
    email character varying(255) NOT NULL,
    "permissionId" uuid NOT NULL,
    phone character varying(255),
    password character varying(255) NOT NULL,
    status boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    role character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor (
    id uuid NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "companyName" character varying(255),
    phone character varying(255) NOT NULL,
    "streetAddress" character varying(255),
    city character varying(255),
    state character varying(255),
    "zipCode" character varying(255),
    country character varying(255),
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.vendor OWNER TO postgres;

--
-- Name: websites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.websites (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    logo character varying(255),
    "userId" uuid NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp with time zone,
    description text,
    "productCount" integer DEFAULT 0
);


ALTER TABLE public.websites OWNER TO postgres;

--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, email, password, "isActive", "lastLogin", "createdAt", "updatedAt", "deletedAt") FROM stdin;
28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	sameershoukat000@gmail.com	Q8Oib01BQG	t	\N	2025-04-09 00:18:41.662+05	2025-04-09 00:18:41.662+05	\N
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "isDefault", "accountId", type, "phoneNumber", street, country, city, state, "postalCode", "createdAt", "updatedAt", "deletedAt", "firstName", "lastName") FROM stdin;
\.


--
-- Data for Name: attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attributes (id, name, slug, "userId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Brand	brand	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:19:42.756+05	2025-02-11 16:22:45.506+05	\N
898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	Manufacturer Number	manufacturer_number	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:18:37.148+05	2025-02-11 16:23:22.589+05	\N
664ba9fc-df2e-4fe1-a0cb-0da06e051906	Manufacturer Name	manufacturer_name	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:24:05.663+05	2025-02-11 16:24:05.663+05	\N
408152a3-888a-41b8-9300-9e004027858a	Manufacturer Warranty	manufacturer_warranty	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:24:26.188+05	2025-02-11 16:24:26.188+05	\N
f349f76e-29eb-4776-9501-386de6efaa8d	Weight	weight	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:24:57.787+05	2025-02-11 16:24:57.787+05	\N
3e5e6507-599d-4819-83ae-00efc64f7ad3	Made By	made_by	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:25:05.057+05	2025-02-11 16:25:05.057+05	\N
e181147d-c67a-4ff5-9cc1-f6c467e18b3a	ABCD	abcd	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:27:35.698+05	2025-02-11 16:28:30.553+05	2025-02-11 16:28:30.553+05
8f1863d7-4279-40cb-ae78-799ce9de6cb9	test	test	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-11 16:50:29.039+05	2025-02-11 16:50:31.407+05	2025-02-11 16:50:31.407+05
607048cb-a553-4797-b190-871ccae3b96b	Bra nd	bra_nd	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-21 18:58:54.798+05	2025-02-21 18:59:16.714+05	2025-02-21 18:59:16.713+05
781bb351-b34a-4e95-bc4c-c374601bd80a	Vehicle type	vehicle_type	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-21 19:31:12.33+05	2025-02-21 19:31:12.33+05	\N
\.


--
-- Data for Name: catalogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.catalogs (id, name, slug, images, "userId", status, "createdAt", "updatedAt", "deletedAt", description, "productCount") FROM stdin;
44d84ec7-429c-4d8b-8355-54a423aa5fa8	Automative	automative	{"uploads\\\\1739024230308-5.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 19:17:10.321+05	2025-03-02 16:18:58.023+05	2025-03-02 16:12:57.63+05	\N	-4
1956c11d-8a47-40ae-b984-c462f33e7024	just testing	just_testing	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:40:42.443+05	2025-03-02 16:40:45.623+05	2025-03-02 16:40:45.622+05		0
30c72371-01b1-4996-80f1-96c47d027be2	Auto Parts & Accessories	auto_parts__accessories	{"uploads\\\\1740914118100-free-photo-of-car-seat-back-organizer-with-multiple-pockets.jpg"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:15:18.207+05	2025-03-02 22:39:19.664+05	\N	{"blocks":[{"key":"3j5i3","text":"🛠 2. Auto Parts & Accessories","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":29,"style":"18px"},{"offset":2,"length":27,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"7apt7","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"f5ch5","text":"A comprehensive collection of essential and aftermarket auto parts to enhance vehicle performance, safety, and aesthetics. From critical components like engines and brakes to accessories like seat covers and alloy wheels, this category ensures vehicle owners have access to everything needed for maintenance, upgrades, and personalization.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	6
b59feafb-c467-4865-a199-6802de24d63d	testaaa	testaaa	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 22:52:26.97+05	2025-02-07 23:55:44.486+05	2025-02-07 23:55:44.486+05	\N	0
cc71aaec-76b2-48c5-8d61-6f4cd2a7ee38	aaaaaaaaa	aaaaaaaaa	{"uploads\\\\1738953214427-zip.png","uploads\\\\1738953214428-6.png","uploads\\\\1738953214431-5.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 22:55:01.68+05	2025-02-07 23:56:30.761+05	2025-02-07 23:56:30.761+05	\N	0
e44328fa-8728-4201-b3aa-f0c0ca501c02	test852	test852	{"uploads\\\\1739024096453-2.png","uploads\\\\1739024096456-1.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 19:14:56.675+05	2025-03-02 16:12:58.96+05	2025-03-02 16:12:58.96+05	\N	0
d61d10af-c90c-4b2e-b0ec-e01bd79572ae	Catalog 99	catalog_99	{"uploads\\\\1738954563162-3.png","uploads\\\\1738954563164-2.png","uploads\\\\1738954563166-1.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 23:56:03.177+05	2025-03-02 16:13:01.154+05	2025-03-02 16:13:01.154+05	\N	0
79634f38-a4da-4750-bb27-47c0075c0671	test	test	{"uploads\\\\1738954894226-3.png","uploads\\\\1738954894232-2.png","uploads\\\\1738954894238-1.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 22:45:27.611+05	2025-03-02 16:13:07.499+05	2025-03-02 16:13:07.499+05	\N	0
56391bb3-589a-4b4e-ab7a-10c26543e059	Performance & Customization	performance__customization	{"uploads\\\\1740914279908-pexels-photo-16119693.webp"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:18:00.015+05	2025-03-02 16:18:00.015+05	\N	{"blocks":[{"key":"99nu","text":"⚙️ 5. Performance & Customization","type":"header-three","depth":0,"inlineStyleRanges":[{"offset":0,"length":33,"style":"18px"},{"offset":3,"length":30,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"4tbd5","text":"For automotive enthusiasts looking to enhance speed, handling, and aesthetics, this category offers high-performance upgrades and customization options. Whether you want to boost horsepower, improve aerodynamics, or personalize your ride, these products cater to every need.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	0
2c374e60-c83a-4df1-9eaa-34c3333a2747	Automobile	automobile	{"uploads\\\\1740913968754-pexels-photo-120049.webp"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:12:48.924+05	2025-03-02 22:22:16.1+05	\N	{"blocks":[{"key":"doqa2","text":"🚗 Automobile Catalog:","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":21,"style":"18px"},{"offset":2,"length":19,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"44oua","text":"This is hub 1.","type":"unordered-list-item","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"14px"}],"entityRanges":[],"data":{}},{"key":"5i38v","text":"This is hub 2.","type":"unordered-list-item","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"14px"}],"entityRanges":[],"data":{}},{"key":"biq29","text":"Lorem Ipsum is simply dummy text used in the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived five centuries and the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	8
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, "catalogId", name, slug, images, "userId", status, "createdAt", "updatedAt", "deletedAt", description, "productCount") FROM stdin;
25367552-1194-459f-8908-e24587ee4e24	2c374e60-c83a-4df1-9eaa-34c3333a2747	SUVs & Crossovers	suvs__crossovers	{"uploads\\\\1740915876421-free-photo-of-sporty-seat-arona-suv-in-manchester-landscape.jpg"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:44:36.571+05	2025-03-02 22:14:02.182+05	\N	{"blocks":[{"key":"65of6","text":"Spacious, high-ground clearance vehicles for on-road and off-road driving.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	2
c15032d3-148b-4ab4-801e-15cf8c8c2a1a	30c72371-01b1-4996-80f1-96c47d027be2	Engine & Transmission	engine__transmission	{"uploads\\\\1740915725795-pexels-photo-190574.jpg"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:26:46.91+05	2025-03-02 20:02:10.619+05	\N	{"blocks":[{"key":"9nftp","text":"Engine & Transmission:","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":22,"style":"BOLD"},{"offset":0,"length":22,"style":"18px"}],"entityRanges":[],"data":{}},{"key":"6a3qu","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1v6cq","text":"Essential components like pistons, camshafts, gearboxes, and fuel injection systems keep your vehicle running smoothly.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	3
066a4372-3fa3-45f9-9802-15fe87865628	2c374e60-c83a-4df1-9eaa-34c3333a2747	Sedans	sedans	{"uploads\\\\1740915811900-pexels-photo-1007410.jpg"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:43:32.041+05	2025-03-02 20:10:02.1+05	\N	{"blocks":[{"key":"dbd71","text":"Comfortable four-door cars suitable for families and daily commuting.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	2
115c75bd-8a4b-4396-a368-48edc6ac1529	2c374e60-c83a-4df1-9eaa-34c3333a2747	Brakes & Suspension 	brakes__suspension_	{"uploads\\\\1740916009868-pexels-photo-27972272.webp"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:46:50.028+05	2025-03-02 22:22:16.103+05	\N	{"blocks":[{"key":"8bggk","text":"Brake pads, rotors, shocks, and struts for smooth handling.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	2
aa29258b-faec-4ad3-bafb-ba2e61b1fd4e	2c374e60-c83a-4df1-9eaa-34c3333a2747	Electric & Hybrid Vehicles	electric__hybrid_vehicles	{"uploads\\\\1740915945569-pexels-photo-12353734.webp"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:45:45.585+05	2025-03-02 20:17:03.857+05	\N	{"blocks":[{"key":"aunbp","text":"Eco-friendly vehicles powered by electricity or hybrid technology","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	2
ef22a26e-ae9b-4790-ad96-530ae1bb3654	44d84ec7-429c-4d8b-8355-54a423aa5fa8	Mercedes	mercedes	{"uploads\\\\1739024256248-4.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 19:17:36.352+05	2025-03-02 16:18:12.89+05	2025-03-02 16:18:12.89+05	\N	0
5e6ff7c8-bb1c-4e65-b94d-285ceaaed978	d61d10af-c90c-4b2e-b0ec-e01bd79572ae	test	test	{"uploads\\\\1738957460138-6.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 00:36:25.544+05	2025-03-02 16:18:14.328+05	2025-03-02 16:18:14.327+05	\N	0
30e41de0-a58b-4216-b133-e008b74e48ae	30c72371-01b1-4996-80f1-96c47d027be2	Tires & Wheels	tires__wheels	{"uploads\\\\1740916099285-pexels-photo-244553.jpg"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 16:48:19.469+05	2025-03-02 22:39:19.67+05	\N	{"blocks":[{"key":"fd1gm","text":"Alloy wheels, steel rims, and all-terrain tires.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	3
1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	44d84ec7-429c-4d8b-8355-54a423aa5fa8	Volvo	volvo	{"uploads\\\\1739024278843-2.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 19:17:59.06+05	2025-03-02 16:18:58.023+05	2025-03-02 16:18:11.595+05	\N	-4
\.


--
-- Data for Name: gallery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery (id, type, image, status, "createdAt", "updatedAt") FROM stdin;
09ee5e7d-64dc-4cfa-8d10-8b289c250d5c	brand	uploads\\1744331296903-new-arrival.jpg	t	2025-04-11 05:28:16.913+05	2025-04-11 05:30:09.999+05
54ce91a7-b6cc-4f97-a599-6f694ff0a888	brand	uploads\\1744406546024-banner.jpeg	t	2025-04-12 02:22:26.036+05	2025-04-12 02:22:26.036+05
b78256a6-7862-484d-bb04-792563a32de7	banner	uploads\\1744406887310-banner.jpeg	t	2025-04-12 02:28:07.315+05	2025-04-12 02:28:07.315+05
456b4349-01de-477f-a430-a02ea50d96f0	brand	uploads\\1744408540959-brand-1.jpeg	t	2025-04-12 02:55:40.964+05	2025-04-12 02:55:40.964+05
aa7388ef-a0ff-47e1-a8b8-599f8e6a61cd	brand	uploads\\1744408545447-brand-2.jpeg	t	2025-04-12 02:55:45.448+05	2025-04-12 02:55:45.448+05
96c675b4-6bc3-4f5a-8d8d-28cddf1a1207	brand	uploads\\1744408549280-brand-3.png	t	2025-04-12 02:55:49.282+05	2025-04-12 02:55:49.282+05
16d159b9-c6f6-4947-9841-bb0372219a53	brand	uploads\\1744408555647-brand-4.jpeg	t	2025-04-12 02:55:55.648+05	2025-04-12 02:55:55.648+05
fbcf075c-a426-4b26-b1b4-1ea26689da87	brand	uploads\\1744408559778-brand-5.png	t	2025-04-12 02:55:59.78+05	2025-04-12 02:55:59.78+05
84a25fce-8837-40c8-a64c-6bb67d1e017c	brand	uploads\\1744408564069-brand-6.jpeg	t	2025-04-12 02:56:04.071+05	2025-04-12 02:56:04.071+05
50f56b60-0129-4351-be85-478bfd25b9fe	brand	uploads\\1744408567920-brand-7.jpeg	t	2025-04-12 02:56:07.921+05	2025-04-12 02:56:07.921+05
9af67a27-8b89-4a9a-9166-d087058277d6	brand	uploads\\1744477507907-brand-3.png	t	2025-04-12 22:05:07.909+05	2025-04-12 22:05:07.909+05
\.


--
-- Data for Name: order_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_history (id, "orderId", status, note, "performerInfo", "performedBy", "createdAt", "updatedAt") FROM stdin;
f82bcf74-6152-421c-a50e-3a8e7d4efbdf	25f91583-fc1c-4fd7-ad63-3330fecbd96e	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:18:42.256+05	2025-04-09 00:18:42.256+05
3ab8e7be-8c2f-4905-9481-9fb91a1cf637	6b449fd4-91a3-4d43-b063-a2c2c2870b4d	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:19:24.206+05	2025-04-09 00:19:24.206+05
fa07a49d-5a28-4d32-a3d4-69989c68463b	2c7227df-8959-4216-8678-a0d4f8fd57aa	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:22:31.776+05	2025-04-09 00:22:31.776+05
6b0d861c-0214-43b0-859e-863d75bc8b44	91f6702b-d65e-45cd-b4a7-0a5e1ef6ca08	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:26:19.008+05	2025-04-09 00:26:19.008+05
8a716c30-54fe-4fa3-ae58-dcf274cbc89e	e0542ce7-3657-4c38-80a2-5b4c7d24d959	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:27:15.519+05	2025-04-09 00:27:15.519+05
fad93f7d-6730-4c4d-abdb-7eb232af484b	241538e1-2224-467f-949c-b47197abdeca	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:28:52.126+05	2025-04-09 00:28:52.126+05
1e5777cc-effe-4c0f-9b84-8a2116f2d25f	37d11afa-0bb6-4202-866a-4d8ee46a5f44	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:32:33.378+05	2025-04-09 00:32:33.378+05
73544729-31c2-4e12-8c4e-75baf72a4ff0	afca6d44-fe78-4962-b146-8e39b7faa57c	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:37:23.47+05	2025-04-09 00:37:23.47+05
a4871601-84c8-40ce-a831-a2c47753a441	31969b01-7010-4b82-bcc9-7d23a6710b30	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:38:31.312+05	2025-04-09 00:38:31.312+05
dd4d5088-a726-4ab3-97df-5375535a267a	a79c98fe-2c0d-42b7-b4ef-37978e176324	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 00:40:24.755+05	2025-04-09 00:40:24.755+05
64f56b9a-188e-401d-92f4-35d7dd3f248e	160c7c11-aa5f-468e-89fd-8753cf9f3c5b	created	Order created	{}	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	2025-04-09 01:03:31.196+05	2025-04-09 01:03:31.196+05
8fdfd89f-80de-4e6d-8b35-2d1e1587eedd	160c7c11-aa5f-468e-89fd-8753cf9f3c5b	processing	this is noted	{"role": "admin", "email": "admin@londontechnicalsupply.com"}	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-12 17:52:07.033+05	2025-04-12 17:52:07.033+05
9f58d93a-01a3-4cd1-b505-c956ca9a92eb	160c7c11-aa5f-468e-89fd-8753cf9f3c5b	processing	jjjjjjj	{"role": "admin", "email": "admin@londontechnicalsupply.com"}	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-12 17:54:21.105+05	2025-04-12 17:54:21.105+05
1ff9260f-0c38-4cef-a5d2-2f77f98cf1c4	160c7c11-aa5f-468e-89fd-8753cf9f3c5b	paid	paid on monday	{"role": "admin", "email": "admin@londontechnicalsupply.com"}	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-12 17:54:37.598+05	2025-04-12 17:54:37.598+05
e460c484-49d2-4eec-b10c-56c12b79807c	160c7c11-aa5f-468e-89fd-8753cf9f3c5b	on_hold	because of shipment	{"role": "admin", "email": "admin@londontechnicalsupply.com"}	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-12 17:54:57.907+05	2025-04-12 17:54:57.907+05
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", "productSnapshot", quantity, "unitPrice", discount, total, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "accountId", website, "shippingAddressSnapshot", "billingAddressSnapshot", currency, subtotal, "shippingCost", tax, discount, total, status, "paymentStatus", metadata, notes, "createdAt", "updatedAt", "deletedAt", items) FROM stdin;
6b449fd4-91a3-4d43-b063-a2c2c2870b4d	LTC-O-1	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:19:24.046+05	2025-04-09 00:19:24.046+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
2c7227df-8959-4216-8678-a0d4f8fd57aa	LTC-O-2	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:22:31.614+05	2025-04-09 00:22:31.614+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
91f6702b-d65e-45cd-b4a7-0a5e1ef6ca08	LTC-O-3	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:26:18.862+05	2025-04-09 00:26:18.862+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
e0542ce7-3657-4c38-80a2-5b4c7d24d959	LTC-O-4	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:27:15.371+05	2025-04-09 00:27:15.371+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
241538e1-2224-467f-949c-b47197abdeca	LTC-O-5	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:28:52.066+05	2025-04-09 00:28:52.066+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
37d11afa-0bb6-4202-866a-4d8ee46a5f44	LTC-O-6	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:32:33.212+05	2025-04-09 00:32:33.212+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
afca6d44-fe78-4962-b146-8e39b7faa57c	LTC-O-7	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	80.00	0.00	200.00	0.00	290.99	pending	unpaid	{}	\N	2025-04-09 00:37:23.402+05	2025-04-09 00:37:23.402+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": 80, "discount": 0, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
31969b01-7010-4b82-bcc9-7d23a6710b30	LTC-O-8	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	80.00	0.00	2.00	0.00	92.99	pending	unpaid	{}	\N	2025-04-09 00:38:31.141+05	2025-04-09 00:38:31.141+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": 80, "discount": 0, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
a79c98fe-2c0d-42b7-b4ef-37978e176324	LTC-O-9	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	80.00	10.99	20.00	0.00	110.99	pending	unpaid	{}	\N	2025-04-09 00:40:24.692+05	2025-04-09 00:40:24.692+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": 80, "discount": 0, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
25f91583-fc1c-4fd7-ad63-3330fecbd96e	LTC-O-0	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": ""}	GBP	NaN	0.00	NaN	NaN	NaN	pending	unpaid	{}	\N	2025-04-09 00:18:42.013+05	2025-04-09 00:46:14.123+05	2025-04-09 00:46:14.121+05	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": null, "discount": null, "quantity": 1, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
160c7c11-aa5f-468e-89fd-8753cf9f3c5b	LTC-O-10	28fd8239-16a0-4d9a-b9b7-f6a04cea8da1	localhost	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": "123fff"}	{"city": "karachi", "phone": "03072283370", "state": "sindh", "lastName": "Shoukat Ali", "firstName": "Sameer", "postalCode": "75230", "addressLine1": "shah faisal colony karachi", "addressLine2": "123fff"}	GBP	160.00	10.99	40.00	0.00	210.99	on_hold	paid	{}	\N	2025-04-09 01:03:31.129+05	2025-04-12 17:54:57.895+05	\N	[{"sku": "FAAQ-3456", "name": "Forged Aluminum Alloy Wheels", "price": 80, "discount": 0, "quantity": 2, "productId": "46f14262-aa1f-4050-9bf0-c2967b49310e"}]
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "orderId", "transactionId", status, amount, currency, method, "gatewayResponse", "refundedAmount", metadata, "createdAt", "updatedAt", "deletedAt") FROM stdin;
3a776ebf-f345-4a06-a186-94a50903eba7	25f91583-fc1c-4fd7-ad63-3330fecbd96e	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:18:42.031+05	2025-04-09 00:18:42.031+05	\N
0cfff842-5fd3-45fd-a98f-5c7453bb893a	6b449fd4-91a3-4d43-b063-a2c2c2870b4d	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:19:24.101+05	2025-04-09 00:19:24.101+05	\N
c5c1ed1c-3af2-4e57-824c-9302660e4365	2c7227df-8959-4216-8678-a0d4f8fd57aa	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:22:31.672+05	2025-04-09 00:22:31.672+05	\N
6114b923-5acc-451a-8e56-15df2c40cb9e	91f6702b-d65e-45cd-b4a7-0a5e1ef6ca08	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:26:18.929+05	2025-04-09 00:26:18.929+05	\N
54b8353f-ee44-48c4-89ef-9f273142a91b	e0542ce7-3657-4c38-80a2-5b4c7d24d959	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:27:15.422+05	2025-04-09 00:27:15.422+05	\N
1d0ee65b-e3d3-47b0-8419-434eb60a279d	241538e1-2224-467f-949c-b47197abdeca	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:28:52.088+05	2025-04-09 00:28:52.088+05	\N
57031c0f-2775-4a8c-aaaf-34071e36d905	37d11afa-0bb6-4202-866a-4d8ee46a5f44	\N	pending	NaN	GBP	cod	\N	0.00	{}	2025-04-09 00:32:33.262+05	2025-04-09 00:32:33.262+05	\N
0939db3f-cd0d-4cc4-882c-30e2e2c73451	afca6d44-fe78-4962-b146-8e39b7faa57c	\N	pending	290.99	GBP	cod	\N	0.00	{}	2025-04-09 00:37:23.423+05	2025-04-09 00:37:23.423+05	\N
63c184f9-66ed-4fcd-b15a-39d2782a280a	31969b01-7010-4b82-bcc9-7d23a6710b30	\N	pending	92.99	GBP	cod	\N	0.00	{}	2025-04-09 00:38:31.199+05	2025-04-09 00:38:31.199+05	\N
f1675b84-3eeb-4be5-bf61-86ef087ef9e7	a79c98fe-2c0d-42b7-b4ef-37978e176324	\N	pending	110.99	GBP	cod	\N	0.00	{}	2025-04-09 00:40:24.716+05	2025-04-09 00:40:24.716+05	\N
3bd9525d-e3d4-4534-8e34-8274935286f5	160c7c11-aa5f-468e-89fd-8753cf9f3c5b	\N	pending	210.99	GBP	cod	\N	0.00	{}	2025-04-09 01:03:31.156+05	2025-04-09 01:03:31.156+05	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, stocks, orders, finance, "createdAt", "updatedAt", purchase, setting) FROM stdin;
d08dbf05-0a7c-49da-b3aa-49ca69f9edce	{view,manage,delete}	{}	{}	2025-02-07 02:55:11.668+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
ad1c4405-1de7-4262-a482-b518cefcb72b	{}	{view,manage,delete}	{}	2025-02-07 02:55:16.492+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
526891f5-151b-4be6-8757-73a14a16b2f0	{}	{}	{view,manage,delete}	2025-02-07 02:55:28.176+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
590264af-c47b-47ba-bc18-575b379141e6	{manage}	{manage}	{delete}	2025-02-07 02:55:36.003+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
7ba9cd25-c0eb-4472-a393-72de01dde92d	{view,manage,delete}	{}	{}	2025-02-07 02:55:42.041+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
62cfdcf1-ae88-4355-bab7-3c272ca81266	{view,manage,delete}	{view,manage,delete}	{}	2025-02-07 02:55:48.323+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
4388a8ad-b727-4f5e-9bd5-d508457b21d6	{view,manage,delete}	{view,manage,delete}	{}	2025-02-07 02:55:55.172+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
6e82b702-3797-4de8-aeb5-bb8796beec9d	{}	{view,manage,delete}	{}	2025-02-07 02:55:59.376+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
49f24362-5a45-438f-901c-1da835ead61b	{view,manage,delete}	{view,manage,delete}	{view,manage,delete}	2025-02-08 19:13:13.221+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
c86e62e6-8c7c-435b-a7ef-b083cf89edfd	{view,manage,delete}	{view,manage,delete}	{view,manage,delete}	2025-02-04 23:27:22.172+05	2025-02-16 19:06:16.253+05	{view,manage,delete}	{view,manage,delete}
b0a84451-d69a-4cab-9fd1-0cc9928e9d06	{}	{}	{}	2025-02-07 02:54:45.552+05	2025-02-16 19:06:16.253+05	{view,manage,delete}	{view,manage,delete}
0677c613-9fbc-4684-b987-a53dbaba4d71	{view,manage,delete}	{}	{}	2025-02-07 02:54:53.95+05	2025-02-16 19:06:16.254+05	{view,manage,delete}	{view,manage,delete}
d760833e-e490-4f7c-b2cc-1c4ba4a3abab	{}	{}	{view,manage}	2025-02-05 00:29:42.454+05	2025-02-16 19:06:16.253+05	{view,manage,delete}	{view,manage,delete}
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (id, "productId", "attributeId", value, "createdAt", "updatedAt") FROM stdin;
4585fdb4-6be6-48d7-9bbc-f4e509c0f817	1a44a3c2-0080-46e4-883b-e7058131308f	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	MAMA2582	2025-02-12 21:34:26.772+05	2025-02-12 21:34:26.772+05
f05ef561-f0de-4496-950a-12d1beb5f60a	1a44a3c2-0080-46e4-883b-e7058131308f	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Mercedes	2025-02-12 21:34:26.772+05	2025-02-12 21:34:26.772+05
90581683-7735-4864-8d4b-b6360ef2b662	1da01f68-976b-4d8a-ac12-90d59e1701cb	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	ADF-800	2025-02-16 00:24:36.297+05	2025-02-16 00:24:36.297+05
d663be32-8c35-4046-b622-8c3447beaf97	1da01f68-976b-4d8a-ac12-90d59e1701cb	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Mercedes	2025-02-16 00:24:36.297+05	2025-02-16 00:24:36.297+05
191357fb-0202-44d0-9787-cd190465fd9f	3368d521-9b24-41a3-a472-bd35244206f8	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	ABCD-82588	2025-03-02 03:55:20.513+05	2025-03-02 03:55:20.513+05
b6082687-3102-408f-8471-b91cf6ca5f50	3368d521-9b24-41a3-a472-bd35244206f8	664ba9fc-df2e-4fe1-a0cb-0da06e051906	ABCD HUB	2025-03-02 03:55:20.513+05	2025-03-02 03:55:20.513+05
c42d657e-c138-472d-b340-b1cfe5b1b2c6	3368d521-9b24-41a3-a472-bd35244206f8	781bb351-b34a-4e95-bc4c-c374601bd80a	Car	2025-03-02 03:55:20.513+05	2025-03-02 03:55:20.513+05
2e7b7bf3-d500-4a81-afec-c20635ab161c	3368d521-9b24-41a3-a472-bd35244206f8	3e5e6507-599d-4819-83ae-00efc64f7ad3	Germany	2025-03-02 03:55:20.513+05	2025-03-02 03:55:20.513+05
86c20946-29a1-42d4-bdb9-d876c05157a6	3368d521-9b24-41a3-a472-bd35244206f8	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Mercedes	2025-03-02 03:55:20.513+05	2025-03-02 03:55:20.513+05
b295695f-a41f-44a2-9bab-e8a887b550b5	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	ABCD-82588	2025-03-02 03:55:37.069+05	2025-03-02 03:55:37.069+05
63a08eec-5a8a-4b98-86c8-d306c7bb512c	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	664ba9fc-df2e-4fe1-a0cb-0da06e051906	ABCD HUB	2025-03-02 03:55:37.069+05	2025-03-02 03:55:37.069+05
9bb254ee-1469-427c-a673-d85644428b79	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	781bb351-b34a-4e95-bc4c-c374601bd80a	Car	2025-03-02 03:55:37.069+05	2025-03-02 03:55:37.069+05
7f9acac2-de34-47c2-b0af-ed5cfb50b824	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	3e5e6507-599d-4819-83ae-00efc64f7ad3	Germany	2025-03-02 03:55:37.069+05	2025-03-02 03:55:37.069+05
d29edf59-689d-41ca-8314-9253833d6886	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Mercedes	2025-03-02 03:55:37.069+05	2025-03-02 03:55:37.069+05
8a3ca699-8188-4981-9c62-457d04bdf53c	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	VPE-800	2025-03-02 19:56:52.618+05	2025-03-02 19:56:52.618+05
ac2c2004-639c-406e-9332-0379fa6b310a	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Ford	2025-03-02 19:56:52.618+05	2025-03-02 19:56:52.618+05
1e57aa93-c3f6-4134-a1f7-79975a9ff85d	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Ford Performance	2025-03-02 19:56:52.618+05	2025-03-02 19:56:52.618+05
ba23dd0a-acc2-4222-8647-27c5347568cf	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	408152a3-888a-41b8-9300-9e004027858a	5	2025-03-02 19:56:52.618+05	2025-03-02 19:56:52.618+05
57b71815-16c3-41e7-897e-6626d155d7ab	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	f349f76e-29eb-4776-9501-386de6efaa8d	25	2025-03-02 19:56:52.618+05	2025-03-02 19:56:52.618+05
6b4ee80d-504a-487c-b590-925c84e1e7ac	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	3e5e6507-599d-4819-83ae-00efc64f7ad3	Japan	2025-03-02 19:56:52.618+05	2025-03-02 19:56:52.618+05
181d8db8-6981-4736-83db-57791fbbbd0b	9c34040f-1639-4813-9d00-bf082e8f4cce	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Tesla	2025-03-02 20:17:03.872+05	2025-03-02 20:17:03.872+05
db474cc6-3b88-4620-a708-bc19236098d1	9c34040f-1639-4813-9d00-bf082e8f4cce	781bb351-b34a-4e95-bc4c-c374601bd80a	Electric	2025-03-02 20:17:03.872+05	2025-03-02 20:17:03.872+05
e6d18087-75d2-4606-92d7-fd1506892929	9c34040f-1639-4813-9d00-bf082e8f4cce	3e5e6507-599d-4819-83ae-00efc64f7ad3	Tesla	2025-03-02 20:17:03.872+05	2025-03-02 20:17:03.872+05
ca65bc5b-1406-41ea-ac63-876809041699	c06bff50-7d60-4183-bb8e-a3ac5232834a	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Honda	2025-03-02 22:10:34.563+05	2025-03-02 22:10:34.563+05
04f4f3bc-bdcb-4bae-a6fd-30ffb670cb27	c06bff50-7d60-4183-bb8e-a3ac5232834a	781bb351-b34a-4e95-bc4c-c374601bd80a	suv	2025-03-02 22:10:34.563+05	2025-03-02 22:10:34.563+05
11f17e56-a059-47e0-8bae-9aad3262ed3d	c06bff50-7d60-4183-bb8e-a3ac5232834a	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Honda	2025-03-02 22:10:34.563+05	2025-03-02 22:10:34.563+05
b2e7cb40-9f2f-499d-985e-6f16beb076b2	c06bff50-7d60-4183-bb8e-a3ac5232834a	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	HO011	2025-03-02 22:10:34.563+05	2025-03-02 22:10:34.563+05
487ed828-6feb-4aa4-bacb-84a2c63fbc5b	eb902bce-0653-4e11-9f70-23207bd4072b	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Wrangler	2025-03-02 22:14:02.191+05	2025-03-02 22:14:02.191+05
7cadeedf-2961-467b-9f4d-41b2dadff692	eb902bce-0653-4e11-9f70-23207bd4072b	3e5e6507-599d-4819-83ae-00efc64f7ad3	JAPAN	2025-03-02 22:14:02.191+05	2025-03-02 22:14:02.191+05
046d3c2b-a61e-457b-b5c8-53bf9cb5c328	eb902bce-0653-4e11-9f70-23207bd4072b	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	JWR-176	2025-03-02 22:14:02.191+05	2025-03-02 22:14:02.191+05
edfa2bc9-df2b-49c5-aa79-0309b562fe90	eb902bce-0653-4e11-9f70-23207bd4072b	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Wagon R	2025-03-02 22:14:02.191+05	2025-03-02 22:14:02.191+05
61680605-54d8-4c76-8dcb-5d8448773713	eb902bce-0653-4e11-9f70-23207bd4072b	f349f76e-29eb-4776-9501-386de6efaa8d	200	2025-03-02 22:14:02.191+05	2025-03-02 22:14:02.191+05
2111fb6f-c5dd-44d4-9ed2-f7d6ed353765	eb902bce-0653-4e11-9f70-23207bd4072b	781bb351-b34a-4e95-bc4c-c374601bd80a	SUV	2025-03-02 22:14:02.191+05	2025-03-02 22:14:02.191+05
0a93c738-c7c5-40b0-b1f2-e0b123c399a1	7a6faa24-ffe8-495f-a027-ff79f7fac600	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Michelin	2025-03-02 22:35:30.348+05	2025-03-02 22:35:30.348+05
36bc4908-2849-4bde-9fbc-63bb71b1194a	7a6faa24-ffe8-495f-a027-ff79f7fac600	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	MDTH-5556	2025-03-02 22:35:30.348+05	2025-03-02 22:35:30.348+05
a46b9372-355c-431c-b5ae-9bee7711aa96	7a6faa24-ffe8-495f-a027-ff79f7fac600	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Michelin House	2025-03-02 22:35:30.348+05	2025-03-02 22:35:30.348+05
c0c7963d-d27e-462e-9303-356470a4c8cd	7a6faa24-ffe8-495f-a027-ff79f7fac600	781bb351-b34a-4e95-bc4c-c374601bd80a	Car	2025-03-02 22:35:30.348+05	2025-03-02 22:35:30.348+05
120abab5-18dd-4680-8949-4a2eba99921c	46f14262-aa1f-4050-9bf0-c2967b49310e	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Enkei	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
ae0bee6b-1c3f-4816-aa8b-c0508300a6bb	46f14262-aa1f-4050-9bf0-c2967b49310e	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	FAAQ-3456	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
6e2b56bb-7e3f-4f34-8884-325a89288b74	46f14262-aa1f-4050-9bf0-c2967b49310e	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Enkei House	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
43d0fb94-ffc5-485d-93be-5281053e70df	46f14262-aa1f-4050-9bf0-c2967b49310e	408152a3-888a-41b8-9300-9e004027858a	4	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
4a7ef46a-4c2b-4ef0-9809-ac3e6e870c0c	46f14262-aa1f-4050-9bf0-c2967b49310e	f349f76e-29eb-4776-9501-386de6efaa8d	10	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
0ceac698-55af-439c-80e1-1ca6e5e8d085	46f14262-aa1f-4050-9bf0-c2967b49310e	3e5e6507-599d-4819-83ae-00efc64f7ad3	Germany	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
dc96f117-fc33-4fe5-8db7-ef573858441f	46f14262-aa1f-4050-9bf0-c2967b49310e	781bb351-b34a-4e95-bc4c-c374601bd80a	Car	2025-03-02 22:39:19.679+05	2025-03-02 22:39:19.679+05
f5474f35-135c-4305-815b-1880575ed28e	81cb51cd-2365-41fd-a5de-34901405a86e	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	Brembo	2025-04-02 18:20:20.984+05	2025-04-02 18:20:20.984+05
84b49432-fa6a-4f09-a49e-8540266cd21b	81cb51cd-2365-41fd-a5de-34901405a86e	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Brembo	2025-04-02 18:20:20.984+05	2025-04-02 18:20:20.984+05
46a51e63-6731-4fac-8027-ebb54c50638e	81cb51cd-2365-41fd-a5de-34901405a86e	408152a3-888a-41b8-9300-9e004027858a	4	2025-04-02 18:20:20.984+05	2025-04-02 18:20:20.984+05
c9510c81-7422-4cf3-9d0e-8f6c6cbfa047	b91b823c-776a-467e-b72c-aad879a13b2a	781bb351-b34a-4e95-bc4c-c374601bd80a	Car	2025-04-02 18:21:03.009+05	2025-04-02 18:21:03.009+05
0242f1a6-a48f-47f4-bc40-50dcbfc58a25	b91b823c-776a-467e-b72c-aad879a13b2a	46800dc5-3c0c-4347-ab4d-aca7e5aa701e	KW Suspension	2025-04-02 18:21:03.009+05	2025-04-02 18:21:03.009+05
b9cef40e-12b7-48e9-b988-17bcc5ab032c	b91b823c-776a-467e-b72c-aad879a13b2a	898e8ae1-0127-46fd-80e0-d3dfc5f6d0bd	ACS-333	2025-04-02 18:21:03.009+05	2025-04-02 18:21:03.009+05
01262237-b061-4893-b0b3-060c29dd3091	b91b823c-776a-467e-b72c-aad879a13b2a	664ba9fc-df2e-4fe1-a0cb-0da06e051906	Italy	2025-04-02 18:21:03.009+05	2025-04-02 18:21:03.009+05
\.


--
-- Data for Name: product_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_codes (id, code, "userId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
066d002a-3d89-483b-bbd8-bb6c9d86ef29	LTS-8998	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 03:30:57.747+05	2025-03-02 03:33:45.41+05	\N
4db75584-159f-4b6a-9ba7-321a5e89deeb	LTS-8999	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:04:09.769+05	2025-03-02 20:04:09.769+05	\N
750b5be7-b5a3-4821-b9d6-40395529b46f	LTS-9000	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:11:16.363+05	2025-03-02 20:11:16.363+05	\N
930a8faa-9807-4403-b5f9-a237b9d55ae6	LTS-9001	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:07:31.09+05	2025-03-02 22:07:31.09+05	\N
dfc11c78-19e4-4677-b768-071cf7135376	LTS-9002	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:15:31.216+05	2025-03-02 22:15:31.216+05	\N
a06b010e-df16-4887-83f8-f84375a409b1	LTS-9003	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:23:09.593+05	2025-03-02 22:23:09.593+05	\N
\.


--
-- Data for Name: product_pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_pricing (id, "productId", currency, "discountType", "discountValue", "basePrice", "finalPrice", "createdAt", "updatedAt") FROM stdin;
23b66fa6-4807-40e3-8ec2-f24772b9eb32	9caa7970-5f6d-4ca0-87a3-d4585270c9c0	USD	fixed	3.00	60.00	\N	2025-02-12 15:01:53.74+05	2025-02-12 15:01:53.74+05
bf5f191b-62d2-4242-a2b5-d213728a2249	05b79a4e-8ea4-41ff-b246-67539f4cfd89	USD	fixed	3.00	60.00	\N	2025-02-12 15:05:23.618+05	2025-02-12 15:05:23.618+05
149b74df-07de-467d-856a-c8b147ed9223	1a44a3c2-0080-46e4-883b-e7058131308f	USD	fixed	10.00	60.00	\N	2025-02-12 21:34:26.78+05	2025-02-12 21:34:26.78+05
ebcf93cf-4a91-4e2f-bcf6-7ac8dbfefe23	1a44a3c2-0080-46e4-883b-e7058131308f	AED	fixed	20.00	170.00	\N	2025-02-12 21:34:26.78+05	2025-02-12 21:34:26.78+05
ad2bcbc1-4ac6-44f7-86db-cf3b640bff64	1a44a3c2-0080-46e4-883b-e7058131308f	GBP	fixed	6.00	85.00	\N	2025-02-12 21:34:26.78+05	2025-02-12 21:34:26.78+05
46f3c853-e3b0-4162-b7de-891103088497	1da01f68-976b-4d8a-ac12-90d59e1701cb	USD	fixed	10.00	100.00	\N	2025-02-16 00:24:36.335+05	2025-02-16 00:24:36.335+05
94f7d412-e258-45c8-8ffa-68975a765f67	3368d521-9b24-41a3-a472-bd35244206f8	AED	fixed	20.00	451.00	\N	2025-03-02 03:55:20.531+05	2025-03-02 03:55:20.531+05
cd3ea9cc-88ff-435d-839f-822c601a97e9	3368d521-9b24-41a3-a472-bd35244206f8	GBP	fixed	6.00	130.00	\N	2025-03-02 03:55:20.531+05	2025-03-02 03:55:20.531+05
6fbb646c-03c5-4a96-b860-290baa09fdae	3368d521-9b24-41a3-a472-bd35244206f8	USD	fixed	10.00	200.00	\N	2025-03-02 03:55:20.531+05	2025-03-02 03:55:20.531+05
2ada7c70-671c-4518-829c-f6113d93438e	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	AED	fixed	20.00	451.00	\N	2025-03-02 03:55:37.076+05	2025-03-02 03:55:37.076+05
3520355c-0eb4-45e1-ad64-32f913726522	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	GBP	fixed	6.00	130.00	\N	2025-03-02 03:55:37.076+05	2025-03-02 03:55:37.076+05
04e966cc-b800-40e9-b018-a5be710ef889	714ccdd2-83fb-4f11-9de0-85e0e915e9ba	USD	fixed	10.00	200.00	\N	2025-03-02 03:55:37.076+05	2025-03-02 03:55:37.076+05
97096d88-d86a-48a7-be95-63dd47a048f1	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	USD	fixed	15.00	200.00	\N	2025-03-02 19:56:52.64+05	2025-03-02 19:56:52.64+05
3bd9135d-f9da-4952-bc52-5a73cbb1a77e	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	GBP	fixed	10.00	150.00	\N	2025-03-02 19:56:52.64+05	2025-03-02 19:56:52.64+05
2d4f3135-aaef-4292-a0da-f01ac41ae51c	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	AED	fixed	37.00	300.00	\N	2025-03-02 19:56:52.64+05	2025-03-02 19:56:52.64+05
85a3b09b-f4a6-4381-96ff-e956c468c27d	7b00e7fe-cac6-417a-a68f-c47884e5a520	USD	percentage	1.00	170.00	\N	2025-03-02 19:59:44.804+05	2025-03-02 19:59:44.804+05
6026f1c5-0e38-470e-95b7-c2ff160d6e7c	7b00e7fe-cac6-417a-a68f-c47884e5a520	GBP	percentage	5.00	130.00	\N	2025-03-02 19:59:44.804+05	2025-03-02 19:59:44.804+05
dc51439e-002c-4b09-8d07-29dc856e4802	7b00e7fe-cac6-417a-a68f-c47884e5a520	AED	percentage	0.00	220.00	\N	2025-03-02 19:59:44.804+05	2025-03-02 19:59:44.804+05
fd4f69df-39c5-442d-8490-c606628c8c8b	675b66f7-b2f6-4618-9cf1-75abfd00d937	USD	fixed	18.00	200.00	\N	2025-03-02 20:02:30.03+05	2025-03-02 20:02:30.03+05
38d6e0e2-3958-44d6-9bb1-a34cbd8d924e	675b66f7-b2f6-4618-9cf1-75abfd00d937	AED	fixed	32.00	320.00	\N	2025-03-02 20:02:30.03+05	2025-03-02 20:02:30.03+05
069b283e-c0aa-42e2-a633-c565db9dc756	675b66f7-b2f6-4618-9cf1-75abfd00d937	GBP	fixed	41.00	160.00	\N	2025-03-02 20:02:30.03+05	2025-03-02 20:02:30.03+05
3771cfce-7d57-405e-be1c-9ee03bf06641	8828946b-1f45-4966-ac01-4f783c546f86	AED	fixed	50.00	800.00	\N	2025-03-02 20:06:35.172+05	2025-03-02 20:06:35.172+05
23ad3fc5-bd6c-4a95-b03a-5d59f3b3ccee	8828946b-1f45-4966-ac01-4f783c546f86	GBP	fixed	28.00	420.00	\N	2025-03-02 20:06:35.172+05	2025-03-02 20:06:35.172+05
fcdfe1b0-8b2e-46b7-a6b8-9d116928547f	d906c1c3-6b78-41d4-98fd-6621f9fb1c8f	USD	percentage	10.00	148.00	\N	2025-03-02 20:10:02.117+05	2025-03-02 20:10:02.117+05
d45cff59-6727-406d-835e-b59151de28af	d906c1c3-6b78-41d4-98fd-6621f9fb1c8f	AED	percentage	10.00	210.00	\N	2025-03-02 20:10:02.117+05	2025-03-02 20:10:02.117+05
4c39319d-fe0f-405b-b132-f40fa0694fa7	d906c1c3-6b78-41d4-98fd-6621f9fb1c8f	GBP	percentage	10.00	114.00	\N	2025-03-02 20:10:02.117+05	2025-03-02 20:10:02.117+05
5414237c-cfbb-4fe1-b8c3-3075f905317e	b0d01e2c-ac3a-4c16-971a-052920a64af0	USD	percentage	4.00	2000.00	\N	2025-03-02 20:14:13.531+05	2025-03-02 20:14:13.531+05
e096f790-c681-47e8-9ef7-a141b4ed8c33	b0d01e2c-ac3a-4c16-971a-052920a64af0	AED	percentage	4.00	397.00	\N	2025-03-02 20:14:13.531+05	2025-03-02 20:14:13.531+05
fa7dd699-abcf-436f-ba8c-fb6a2da0d6ef	b0d01e2c-ac3a-4c16-971a-052920a64af0	GBP	percentage	4.00	1650.00	\N	2025-03-02 20:14:13.531+05	2025-03-02 20:14:13.531+05
d7254c35-e316-40ab-bb53-da1985018585	9c34040f-1639-4813-9d00-bf082e8f4cce	USD	percentage	10.00	2100.00	\N	2025-03-02 20:17:03.935+05	2025-03-02 20:17:03.935+05
b8b1e09e-a3ad-43ef-af88-def5a75e4ead	9c34040f-1639-4813-9d00-bf082e8f4cce	GBP	percentage	17.00	3200.00	\N	2025-03-02 20:17:03.935+05	2025-03-02 20:17:03.935+05
b554c879-7215-4e30-beed-9f01df2e9af6	9c34040f-1639-4813-9d00-bf082e8f4cce	AED	percentage	11.00	4100.00	\N	2025-03-02 20:17:03.935+05	2025-03-02 20:17:03.935+05
f0f1129d-1248-4458-9853-7957e9f8c0cf	c06bff50-7d60-4183-bb8e-a3ac5232834a	USD	fixed	12.00	150.00	\N	2025-03-02 22:10:34.592+05	2025-03-02 22:10:34.592+05
40a5f5b8-77bb-4c86-979d-9d614ecd8b00	c06bff50-7d60-4183-bb8e-a3ac5232834a	GBP	fixed	10.00	125.00	\N	2025-03-02 22:10:34.592+05	2025-03-02 22:10:34.592+05
7c67b1c3-e8d5-4182-b12f-382bbd8d9f84	c06bff50-7d60-4183-bb8e-a3ac5232834a	AED	fixed	19.00	220.00	\N	2025-03-02 22:10:34.592+05	2025-03-02 22:10:34.592+05
6be3f72f-a255-48fc-82ad-af3dd1732789	eb902bce-0653-4e11-9f70-23207bd4072b	USD	percentage	10.00	125.00	\N	2025-03-02 22:14:02.225+05	2025-03-02 22:14:02.225+05
5d3bd72f-3452-438b-8439-e8d6e519a95b	eb902bce-0653-4e11-9f70-23207bd4072b	GBP	percentage	10.00	100.00	\N	2025-03-02 22:14:02.225+05	2025-03-02 22:14:02.225+05
92c48748-2026-4f51-97c3-224d22b2bb77	eb902bce-0653-4e11-9f70-23207bd4072b	AED	percentage	10.00	296.00	\N	2025-03-02 22:14:02.225+05	2025-03-02 22:14:02.225+05
9e360628-1939-41cd-a9ee-fec5b041aa42	7a6faa24-ffe8-495f-a027-ff79f7fac600	USD		0.00	93.00	\N	2025-03-02 22:35:30.394+05	2025-03-02 22:35:30.394+05
2756f9b5-04ab-4daa-be4f-87b49d82916a	46f14262-aa1f-4050-9bf0-c2967b49310e	GBP		0.00	80.00	\N	2025-03-02 22:39:19.711+05	2025-03-02 22:39:19.711+05
68608319-710d-4a0e-9559-dcae586b7668	46f14262-aa1f-4050-9bf0-c2967b49310e	AED		0.00	195.00	\N	2025-03-02 22:39:19.711+05	2025-03-02 22:39:19.711+05
59a27310-4a36-490d-8194-da642017f551	81cb51cd-2365-41fd-a5de-34901405a86e	GBP	percentage	10.00	150.00	\N	2025-04-02 18:20:20.989+05	2025-04-02 18:20:20.989+05
01fd6e72-42e5-4b59-9c8e-8395183a8d43	81cb51cd-2365-41fd-a5de-34901405a86e	USD	percentage	10.00	183.00	\N	2025-04-02 18:20:20.989+05	2025-04-02 18:20:20.989+05
42e8f000-3fd4-4d3d-a15b-00a908d3e335	81cb51cd-2365-41fd-a5de-34901405a86e	AED	percentage	13.00	400.00	\N	2025-04-02 18:20:20.989+05	2025-04-02 18:20:20.989+05
d71f5410-998b-4863-9f7a-539942d42044	b91b823c-776a-467e-b72c-aad879a13b2a	USD	percentage	13.00	200.00	\N	2025-04-02 18:21:03.082+05	2025-04-02 18:21:03.082+05
62c2eb91-5c8b-45fe-a2ff-91a16921c229	b91b823c-776a-467e-b72c-aad879a13b2a	GBP	percentage	13.00	148.00	\N	2025-04-02 18:21:03.082+05	2025-04-02 18:21:03.082+05
4f73fd89-5cb0-4822-a59a-d7a9f1d7d225	b91b823c-776a-467e-b72c-aad879a13b2a	AED	fixed	49.00	320.00	\N	2025-04-02 18:21:03.082+05	2025-04-02 18:21:03.082+05
\.


--
-- Data for Name: product_quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_quotes (id, name, email, phone, message, "productId", status, "createdAt", "updatedAt") FROM stdin;
029705fb-835d-4140-a343-fbfb58de9e6d	Sameer Shoukat	sameer123@example.com	+1-234-567-8900	I'm interested in this product and would like more information	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	completed	2025-03-23 19:41:22.305+05	2025-03-23 19:44:35.762+05
06bf1868-95fa-4525-91e8-1d36f7c74c30	Sameer Shoukat Ali	sameershoukat000@gmail.com	03072283370	This is a message	8828946b-1f45-4966-ac01-4f783c546f86	pending	2025-03-31 19:54:41.625+05	2025-03-31 19:54:41.625+05
4ca01c24-563d-47c5-bd67-ac3511e3a4f7	Sameer Shoukat Ali	sameershoukat000@gmail.com	03072283370	this is just a message	8828946b-1f45-4966-ac01-4f783c546f86	pending	2025-03-31 20:00:08.067+05	2025-03-31 20:00:08.067+05
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (id, rating, name, email, title, content, "productId", status, "createdAt", "updatedAt") FROM stdin;
9ff1ebd7-2650-455e-9db3-1f32299bc02a	4.5	David Henry	henry852@example.com	Great Product!	This product exceeded my expectations...	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	approved	2025-03-23 19:47:43.596+05	2025-03-23 19:59:05.486+05
5758ba88-8d75-46c4-b2c3-12c91073438e	5	Alice Johnson	alice.johnson@example.com	Amazing Experience!	I absolutely love this product. It exceeded all my expectations and I couldn't be happier with my purchase!	8828946b-1f45-4966-ac01-4f783c546f86	approved	2025-03-31 20:48:08.981+05	2025-03-31 21:11:47.899+05
be6c5c8c-1a67-49b4-9b13-8a55c31cdf4d	4	Michael Smith	michael.smith@example.com	Great but Room for Improvement	The product works well and meets my needs. However, a few minor issues could be improved in future versions.	8828946b-1f45-4966-ac01-4f783c546f86	approved	2025-03-31 21:40:57.891+05	2025-03-31 21:43:56.333+05
d4694286-b463-4db1-b2b7-6d1972aba5a6	4	David Lee	david.lee@example.com	Disappointed	Unfortunately, the product did not live up to the hype. It had several issues that made it hard to use as intended.	8828946b-1f45-4966-ac01-4f783c546f86	approved	2025-03-31 21:44:45.698+05	2025-03-31 21:45:08.018+05
a50f69b2-824c-4849-bee0-5779d3e7ec69	5	Sarah Martinez		Would Not Recommend	My experience was very negative. The quality is poor, and it did not function as described. I would not repurchase it.	8828946b-1f45-4966-ac01-4f783c546f86	approved	2025-03-31 21:46:47.997+05	2025-04-10 05:00:38.061+05
f5f6f23c-2b4a-4181-904a-b43e08b7d2c7	4	John Doe	john@example.com	Great Product!	This product exceeded my expectations...	2b1f4ce0-aa1e-480a-a148-97e54f0186f1	approved	2025-03-23 19:46:55.995+05	2025-04-10 05:01:02.328+05
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tags (id, name, slug, description, image, status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
ee4579b4-75e0-45f6-b75d-765f855971e2	Tag Name	tag_name	Updated tag description	uploads\\1744327366557-download.jpg	t	2025-04-11 04:21:30.26+05	2025-04-11 04:23:02.462+05	2025-04-11 04:23:02.462+05
156c2a44-71b3-4b82-ab2f-f7bb6a800e9b	ON SALE	on_sale	Products marked as "on_sale" are currently offered at a discounted price. This tag highlights items that are on promotion, allowing customers to easily find products with special pricing or time-limited offers.	uploads\\1744327947035-7-2.jpg	t	2025-04-11 04:32:27.099+05	2025-04-11 04:32:27.099+05	\N
59bc7796-a0b2-45e1-bb7a-4653147afb9e	BEST SELLING	best_selling	The "best_selling" tag is used to indicate items that consistently perform well in sales. These products are popular among customers, reflecting high demand, customer trust, and positive feedback.	uploads\\1744327999576-bestselling-cars-collage-66101ee963780.jpg	t	2025-04-11 04:33:19.638+05	2025-04-11 04:33:19.638+05	\N
70562137-a37e-4c6a-bdc2-c27468289138	FEATURE 99	feature_99	Products marked as "feature" receive special promotional focus. These items are highlighted because of their innovation, quality, or strategic importance in the market, making them stand out from regular offerings.	uploads\\1744328272157-bestselling-cars-collage-66101ee963780.jpg	t	2025-04-11 04:37:52.173+05	2025-04-11 04:38:28.57+05	2025-04-11 04:38:28.569+05
5b392a7a-444b-4f52-ae8b-4a7f1ec17b65	FEATURE 250	feature_250	Products marked as "feature" receive special promotional focus. These items are highlighted because of their innovation, quality, or strategic importance in the market, making them stand out from regular offerings.	uploads\\1744328381166-bestselling-cars-collage-66101ee963780.jpg	t	2025-04-11 04:39:41.194+05	2025-04-11 04:41:40.104+05	2025-04-11 04:41:40.103+05
30e95959-75c9-4e54-9d01-6c73f7d6be8d	FEATURE 360	feature_360	Products marked as "feature" receive special promotional focus. These items are highlighted because of their innovation, quality, or strategic importance in the market, making them stand out from regular offerings.	uploads\\1744328512154-bestselling-cars-collage-66101ee963780.jpg	t	2025-04-11 04:41:52.224+05	2025-04-11 04:42:36.746+05	2025-04-11 04:42:36.746+05
4c846cf9-83ba-4c65-860c-4a7cdc6b6fc4	NEW ARRIVAL	new_arrival	Items tagged as "new_arrival" represent the latest additions to the product catalog. This tag helps customers quickly identify fresh, modern, and recently released products.	uploads\\1744413281680-features.jpg	t	2025-04-11 04:35:46.079+05	2025-04-12 04:14:41.7+05	\N
118338f5-e9d3-4165-815e-83991f497e47	Feature	feature	Products marked as "feature" receive special promotional focus. These items are highlighted because of their innovation, quality, or strategic importance in the market, making them stand out from regular offerings.	uploads\\1744413236439-features.jpg	t	2025-04-11 04:36:37.651+05	2025-04-12 19:47:13.294+05	\N
61445e52-3856-49a0-b9d0-9e200228f81e	Sameer Shoukat Ali	sameer_shoukat_ali	hello world	uploads\\1744470391282-brand-7.jpeg	f	2025-04-12 19:57:12.611+05	2025-04-12 20:24:35.06+05	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, slug, description, images, status, version, "inStock", "catalogId", "catId", "subCategoryId", "websiteId", "userId", "createdAt", "updatedAt", "deletedAt", "saleStock", "productCode", tags) FROM stdin;
9caa7970-5f6d-4ca0-87a3-d4585270c9c0	ADD-10025	test865	test865	this is description	{"uploads\\\\1739354513446-2.png"}	draft	1	599	44d84ec7-429c-4d8b-8355-54a423aa5fa8	1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0	{41b54fdf-d8c8-4abe-9779-2f93f858fc38}	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-12 15:01:53.711+05	2025-02-12 16:01:54.456+05	2025-02-12 16:01:54.456+05	0	\N	{}
3368d521-9b24-41a3-a472-bd35244206f8	ADD-10099	Memory 986	memory_986	This is description	\N	active	6	100	44d84ec7-429c-4d8b-8355-54a423aa5fa8	1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0	{}	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-22 18:24:07.08+05	2025-03-02 16:18:51.819+05	2025-03-02 16:18:51.819+05	0	066d002a-3d89-483b-bbd8-bb6c9d86ef29	{}
714ccdd2-83fb-4f11-9de0-85e0e915e9ba	ADD-10097	Memory 985	memory_985	This is description	{"uploads\\\\1740228545633-android-chrome-512x512.png"}	publish	9	100	44d84ec7-429c-4d8b-8355-54a423aa5fa8	1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-22 17:42:24.531+05	2025-03-02 16:18:53.251+05	2025-03-02 16:18:53.251+05	0	066d002a-3d89-483b-bbd8-bb6c9d86ef29	{}
1da01f68-976b-4d8a-ac12-90d59e1701cb	ADD-10096	Memory	memory		{"uploads\\\\1739559746645-banner.jpeg"}	draft	29	900	\N	\N	\N	{}	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-15 00:02:26.963+05	2025-03-02 16:18:54.748+05	2025-03-02 16:18:54.748+05	0	\N	{}
1a44a3c2-0080-46e4-883b-e7058131308f	ADD-10098	test955	test955	this is description	{"uploads\\\\1739355293293-4.png"}	publish	2	599	44d84ec7-429c-4d8b-8355-54a423aa5fa8	1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0	{41b54fdf-d8c8-4abe-9779-2f93f858fc38}	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-12 15:14:53.31+05	2025-03-02 16:18:56.94+05	2025-03-02 16:18:56.94+05	0	\N	{}
05b79a4e-8ea4-41ff-b246-67539f4cfd89	ADD-10095	test950	test950	this is description	{"uploads\\\\1739354723465-2.png"}	draft	11	599	44d84ec7-429c-4d8b-8355-54a423aa5fa8	1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0	{41b54fdf-d8c8-4abe-9779-2f93f858fc38}	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-12 15:05:23.591+05	2025-03-02 16:18:58.034+05	2025-03-02 16:18:58.034+05	0	\N	{}
9c34040f-1639-4813-9d00-bf082e8f4cce	EVC-100	EV Home Charger	ev_home_charger	A fast home charging station compatible with multiple EVs.	{"uploads\\\\1740928623629-pexels-photo-9800009.webp","uploads\\\\1740928623629-pexels-photo-9800002.webp"}	publish	1	100	2c374e60-c83a-4df1-9eaa-34c3333a2747	aa29258b-faec-4ad3-bafb-ba2e61b1fd4e	fb1bf9ea-fc06-4ff8-bb48-ba19fe5bd46f	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:17:03.827+05	2025-03-02 20:17:03.827+05	\N	0	750b5be7-b5a3-4821-b9d6-40395529b46f	{}
c06bff50-7d60-4183-bb8e-a3ac5232834a	HCRV-999	Honda CR-V	honda_cr-v	A fuel-efficient compact SUV with spacious cargo space.	{"uploads\\\\1740935434423-free-photo-of-black-honda-hr-v.jpg"}	publish	1	100	2c374e60-c83a-4df1-9eaa-34c3333a2747	25367552-1194-459f-8908-e24587ee4e24	cfa109ec-576a-496f-bc75-256397b604b0	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:10:34.538+05	2025-03-02 22:10:34.538+05	\N	0	930a8faa-9807-4403-b5f9-a237b9d55ae6	{}
7a6faa24-ffe8-495f-a027-ff79f7fac600	MDTH-5556	Michelin Defender T+H	michelin_defender_th	Durable all-season tires with enhanced traction and longevity.	{"uploads\\\\1740936603180-free-photo-of-off-road-adventure-with-rugged-suv-on-rocky-terrain.jpg"}	publish	1	100	30c72371-01b1-4996-80f1-96c47d027be2	30e41de0-a58b-4216-b133-e008b74e48ae	67de5196-e4f0-4add-986b-428841557e68	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:30:03.298+05	2025-03-02 22:30:03.298+05	\N	0	a06b010e-df16-4887-83f8-f84375a409b1	{}
7b00e7fe-cac6-417a-a68f-c47884e5a520	SMT-900	6-Speed Manual Transmission	6-speed_manual_transmission	A durable 6-speed manual gearbox for smooth shifting.	{"uploads\\\\1740927584531-pexels-photo-14319182.jpg"}	publish	2	170	30c72371-01b1-4996-80f1-96c47d027be2	c15032d3-148b-4ab4-801e-15cf8c8c2a1a	0718c1bf-aafc-4bb0-8189-6e974f5b221d	{3b980e63-d9ea-4d0f-b953-84fb08ff0bf2}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 19:59:44.747+05	2025-03-23 21:01:07.042+05	\N	0	066d002a-3d89-483b-bbd8-bb6c9d86ef29	{on_sale}
46f14262-aa1f-4050-9bf0-c2967b49310e	FAAQ-3456	Forged Aluminum Alloy Wheels	forged_aluminum_alloy_wheels	Lightweight and durable alloy wheels for performance vehicles.	{"uploads\\\\1740937159531-pexels-photo-12712468.jpg"}	publish	4	110	30c72371-01b1-4996-80f1-96c47d027be2	30e41de0-a58b-4216-b133-e008b74e48ae	1eef36c2-a2ef-4d6e-addb-c14128f432cf	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:39:19.646+05	2025-03-23 21:03:02.454+05	\N	0	a06b010e-df16-4887-83f8-f84375a409b1	{best_selling}
81cb51cd-2365-41fd-a5de-34901405a86e	CBP-54	Ceramic Brake Pads	ceramic_brake_pads	High-performance ceramic brake pads for improved stopping power.	{"uploads\\\\1740935890787-pexels-photo-3642618.jpg"}	publish	3	100	2c374e60-c83a-4df1-9eaa-34c3333a2747	115c75bd-8a4b-4396-a368-48edc6ac1529	d524aee6-3ce8-4640-913f-da1176a19689	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:18:10.945+05	2025-04-02 18:20:20.97+05	\N	0	a06b010e-df16-4887-83f8-f84375a409b1	{on_sale}
eb902bce-0653-4e11-9f70-23207bd4072b	JWR-666	Jeep Wrangler Rubicon	jeep_wrangler_rubicon	A rugged 4x4 SUV designed for extreme off-road adventures.	{"uploads\\\\1740935642087-free-photo-of-jeep-wrangler-with-safety.jpg"}	publish	2	100	2c374e60-c83a-4df1-9eaa-34c3333a2747	25367552-1194-459f-8908-e24587ee4e24	43d2bdb6-4348-49ef-b397-f0c8c061e12a	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:14:02.165+05	2025-03-23 21:04:13.948+05	\N	0	930a8faa-9807-4403-b5f9-a237b9d55ae6	{on_sale}
2b1f4ce0-aa1e-480a-a148-97e54f0186f1	ET-5699	V8 Performance Engine	v8_performance_engine	A high-performance V8 engine designed for speed and power.	{"uploads\\\\1740927412234-pexels-photo-190574.webp"}	publish	2	100	30c72371-01b1-4996-80f1-96c47d027be2	c15032d3-148b-4ab4-801e-15cf8c8c2a1a	fd202ea7-81cf-4dfe-8ec1-22239862a5bc	{0479d6e2-9dee-40c8-ab65-9343b4c9cd45}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 19:56:52.458+05	2025-03-23 21:04:34.468+05	\N	0	066d002a-3d89-483b-bbd8-bb6c9d86ef29	{best_selling}
8828946b-1f45-4966-ac01-4f783c546f86	TC-2024	Toyota Corolla 2024	toyota_corolla_2024	A fuel-efficient compact sedan with advanced safety features.	{"uploads\\\\1740927994896-free-photo-of-raindrops-on-black-toyota-corolla.jpg"}	publish	2	165	2c374e60-c83a-4df1-9eaa-34c3333a2747	066a4372-3fa3-45f9-9802-15fe87865628	1c45ccfe-dbff-4d93-a68a-6e753bef9ba7	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:06:35.124+05	2025-04-02 17:26:50.432+05	\N	0	4db75584-159f-4b6a-9ba7-321a5e89deeb	{feature}
675b66f7-b2f6-4618-9cf1-75abfd00d937	HPFP-901	High-Pressure Fuel Pump	high-pressure_fuel_pump	Efficient fuel pump for optimal engine performance.	{"uploads\\\\1740927730430-pexels-photo-2569842.jpg"}	publish	6	100	30c72371-01b1-4996-80f1-96c47d027be2	c15032d3-148b-4ab4-801e-15cf8c8c2a1a	34651f70-0d66-4b70-8289-fb7c269da073	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:02:10.588+05	2025-03-23 21:28:56.295+05	\N	0	066d002a-3d89-483b-bbd8-bb6c9d86ef29	{on_sale,best_selling}
d906c1c3-6b78-41d4-98fd-6621f9fb1c8f	MBS-999	Mercedes-Benz S-Class	mercedes-benz_s-class	A premium sedan with luxurious interiors and cutting-edge technology.	{"uploads\\\\1740928201820-pexels-photo-26691319.webp"}	publish	2	110	2c374e60-c83a-4df1-9eaa-34c3333a2747	066a4372-3fa3-45f9-9802-15fe87865628	0d9339c8-c768-4528-953d-3a2a851185e4	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:10:02.061+05	2025-04-02 17:27:09.151+05	\N	0	4db75584-159f-4b6a-9ba7-321a5e89deeb	{feature}
b0d01e2c-ac3a-4c16-971a-052920a64af0	BEV-100	Battery Electric Vehicles (BEVs)	battery_electric_vehicles_bevs	A fully electric sedan with autopilot and a long-range battery.	{"uploads\\\\1740928453239-pexels-photo-9800029.jpg"}	publish	2	100	2c374e60-c83a-4df1-9eaa-34c3333a2747	aa29258b-faec-4ad3-bafb-ba2e61b1fd4e	e850048e-0e10-4ef3-a603-a3ecff2dd05a	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 20:14:13.475+05	2025-04-02 17:27:28.237+05	\N	0	750b5be7-b5a3-4821-b9d6-40395529b46f	{feature}
b91b823c-776a-467e-b72c-aad879a13b2a	ACS-333	Adjustable Brake Caliber Hardware	adjustable_brake_caliber_hardware	Enhance handling and ride comfort with an adjustable coilover system.	{"uploads\\\\1740936135912-free-photo-of-close-up-of-motorbike-fork.jpg"}	publish	3	100	2c374e60-c83a-4df1-9eaa-34c3333a2747	115c75bd-8a4b-4396-a368-48edc6ac1529	731f909b-8918-4923-9f94-6543e8033b41	{8e4c7d45-a9ba-4ada-a88d-ae73424e11f1}	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 22:22:16.087+05	2025-04-02 18:17:29.702+05	\N	0	a06b010e-df16-4887-83f8-f84375a409b1	{on_sale}
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, currency, quantity, "costPrice", "totalAmount", status, "vendorId", "productId", "userId", "createdAt", "updatedAt") FROM stdin;
23800892-069a-443e-9828-85b2f339e4f5	USD	10	100.00	1000.00	completed	a34c9113-8def-4b05-86d3-2f6d7515cdc2	46f14262-aa1f-4050-9bf0-c2967b49310e	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-02 23:09:15.255+05	2025-03-02 23:09:15.255+05
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt") FROM stdin;
fba269ee-71c6-489b-bcef-5220a29e9af5	c2faedd821900b8a258e2136dd331d585bc6e4334fa7a958450f4f5cd29daa1d5c8c27fd69bb0579	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-06 23:27:51.638+05
cce17eef-13a4-4e56-a6d3-285eb42feb85	b28fc8b3954a4f35418ede3b25842f14e03901c34d6bd56394ace66f37ab3126ec9dd9d09574a1de	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-07 00:05:31.461+05
229d3995-dbb7-4b4c-a602-7c1248989051	01ed08d894446a4daf0cc15652da2042788e8b1ef644d6a8462897de99202352696ce17ec0d8c443	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-07 00:11:00.386+05
41415860-7472-43de-8dbd-5db876eca453	f124250ee92d7334f0a92dd0252e4240261e94e1ba6a76c7a2210eeef3a72673a58080a295549062	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 02:46:50.306+05
8cf68377-741a-4ac7-9be5-cb726397b2bd	2ee130aeae5a1c7cb4be9c49699fa6e8351c6431c5247c97b3632d4ce49e56135b89744c7aecd90d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 03:47:16.132+05
864512d1-54af-4215-9437-41f0ac3a5030	37b48b51a83e23954670b1917155bddd46810d4b6c6148620659c6a214687de9d9da6fb8f7a22dd3	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 15:47:56.042+05
9ae63f6c-64db-4da1-9d80-c0e46fc855ce	1f51396d2520b9f4ce20fabdecf82bf6485ef4f00ab03afde46e7e9dc01670810962276c9b15310c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 16:52:14.385+05
5c8ebd86-c2c3-4be7-9a04-cc4a2c42401a	29480fcc2ff32eaf479f846503e4ebd4a94a486a1079794e4d43d08212ab610fa2b2ac3b71015d17	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 17:52:37.447+05
5407c00b-e66f-4654-80ad-3a4186d710e4	3c714daa34ba6b67e8eaad7efa52f773b376d55217b6838c87afd930f09857295e21d1537ee8f457	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 17:52:56.273+05
071c13de-b10e-4e55-b2d7-c02d3e626a84	212861b5225a9993b8eb4be77313581208b9adbe6c60407ad6b90703b377b688b550cca10b766e57	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 19:13:54.642+05
d3687a19-591d-41d0-abcb-34093af09258	5efd0ad2209b831fa1f990dd1a3216639e66b383fdcc230ecde611e76541fdae4ea9e490ea38bd68	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 20:00:03.837+05
189a574d-5d6e-46de-b3c3-a4cdef6b367a	b6a0717271d899ab052bc52b1d238bb7c3b1203495bd8ff272ecc0ecad2a6cb4507b38f7857f3b88	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 20:14:18.599+05
b76c52da-8b91-47ed-a020-952435a8d4aa	4b83b9d652593ed4642a8537b012e03a85a0611b52f9b76caf55f21f833e6dad38fc6b4e44f4e1c6	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 21:37:26.421+05
7e17b7a9-6666-4fbb-bf43-b6ff783130a4	e2344e3cbc1babaec10de23e167d6a75b9525ce05fc20e3a1bbf2b8fc20dd731ac570433130657e9	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 22:40:47.958+05
0613d72f-28ae-4d9e-94f0-88561d72be4d	724d1c5aba564c29af8837de3f6f28b0d5df48883039c49fa1c88f03637947a667e84034d9f70996	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-09 23:43:40.296+05
4f8183b0-8204-496f-8777-c5e07ed3d7fa	cc1c2e788ada8951344b3c115173de2bead17f4d4ba6ca333d27619c7ad57c06f2dad6635c1e5f4a	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-10 00:03:41.486+05
1d7d08a6-3c6f-4730-b0dc-185af4181f07	20420b9c892d1bb09e5f742f3baf5e71268862213813246d2e425c36cd2b6ee4aba84142b9b0436c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-10 00:08:45.047+05
154f619f-8a2a-444c-af62-dfd1bc9b3214	e84ad31493f8080ee862ef1313ed64bb7ae0ed45d6db61998fe2bf22d765898010b369578821fb10	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-10 00:09:33.002+05
bb31336b-aa5f-4541-9c72-481ecfe73bf9	565cc0f25d9d8de984160d83a80e2a5a5d40dabd536e89b2c862456080d28a2280d8489ba24a636c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-10 00:44:01.041+05
8c9ad233-369c-434a-a376-2740128d5e3e	08d5505877c2cade899eb25de0291d8c0fb71a484262e7d438c597f57ef099ce657213152aeefdab	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-10 19:12:29.423+05
fab3636b-fee4-4b13-a69e-978dd8d92988	c2b3fd7e65a23aa19d3436b9f3fb722c949e302c7e20d296cfe805042925cfc71db3b6698b60352d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-10 20:17:33.257+05
0e1a752f-b41b-47a3-a485-6c07ac4f1e3e	23bb6e000c4bf0bb8bc5245f672a6aa62d6b5ff500b17cdfa3541b9466b59ae6228a30972817f6e4	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-11 13:40:00.469+05
b223ba84-4f76-4b4d-b52d-6aaa3fc14956	58e3787515e58108d13ec5d6fb1806f5770b2a88e520c1923bb649b2f76fa6ef2e44fc881da05432	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-11 18:35:43.234+05
a900bab1-27f3-4361-98fb-f4dd85686a23	b5e6d75e2dea1233b36ef9ccf6780938f8cb9a47a8c2828c34da3cd321de4f7d853922137946f74c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 14:50:51.544+05
09a69caa-8902-43b8-8eba-7e07af7825a9	55d1e7f413cd853a38e92d531693dff4b2adccb5ce54bb6afc04ba12b125c223a6e66d8468f902e5	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 14:51:15.292+05
a00a2fc8-21c7-4eb6-aca2-08d5445f81b1	407e9276eef5ee0325e37e8d32b93349c18f6d3ce5f138c0c5a69d03daa4180e02f137163106e87b	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 15:53:37.211+05
1393e562-0b49-40a3-a580-faa4e984284b	858756eeb44c917f8d32e38fada1cf6c15c0e0d8821f0faf5c9ca6b56998dfc6e00e73d567115151	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 17:49:18.968+05
78f61acf-a871-4f9a-9c34-7f37ece50c93	6cd94e5e95af3e380293b0b28f2e3060a3c88fb0b68d8f2a705f55e21bc04f5df21086a81b336792	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 18:49:35.183+05
82196e74-ed08-4a71-8f26-b0ee12e938de	9ae358c82f5b92384e79d3b76d728016cf7ba0b2e8fb256ca2ac9346735a909bbdc7a2e079bf0540	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 19:51:39.396+05
a3373d27-d5b5-4cbe-8ede-b7e1e437410d	a4e0aea05b6348f035d185e497e821d0da18daad190f63973c1d9b9270456429518d6a90b458fea2	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-12 19:51:39.592+05
52bdf367-d116-4aa4-9d49-c2e6a8c6488f	ff7383d4a971249d01198cf0dc6fe67f03e120aa7d3e7e41dc075edd8fc3b5ad1d9b00812afd427e	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 14:55:14.24+05
bb168345-1b0a-4fbc-9457-c159699238b0	df238a46a643ae4ba7bbc77029cf90b1fdaeca10842752a447cfc1d89760b3f149949f9117035fb2	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 14:55:47.518+05
6d1f5dcc-d280-4177-b6c4-22d7ef3e5521	5fa87ed87ba02b46d1b1f531179f0c8f6e10d96ced66bf77dda0769998d133d58ceff19ac07c8398	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 15:23:26.293+05
a0174633-a8f8-44b0-9ebb-ef01ed043834	ffd96e7074bd118d71321219de30983992b65902e5857f8ac17a10eaff10203523cc5403630a13ae	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 15:59:35.156+05
15d7da20-3d5e-4c9a-bc6f-7cc75a649e91	2c26267f1eb64f4e86046b5ed31a554388efa4264ea5e85ac861691e7953b9bb9652e05962eb33a5	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 16:11:39.54+05
20602bd0-5358-4922-9d01-aa5d82f8b28c	40dc584b05ccbc33ed90691428653a8a6930aa43d530359dd6c6061edda04af24b1b8184cb2a29c3	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 16:15:33.206+05
7895d6f1-bcf7-41f1-b969-1a872a6bfc96	9071ea0622a4e1bc8d730e849cfb8684f6f180cfc15c6b3f8c7142f117bcb5f1fe2ecb9569ce40b5	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 18:19:51.58+05
203862e4-73a4-46a3-9d96-39e14320b046	d7f7d5df33df207c18a5c28769bbd2b28c272fbb979282c64572b90173aa1f88621f1d79bd10a631	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 20:03:54.239+05
a23c5192-edf6-461d-8255-7fa28a2f24e3	f2f288a3248613b02b709faa5656a6b619ef17af116cde5f603bedd939618aaf3e69edc11d7b7338	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 20:08:30.226+05
80885198-3f44-4fe5-8b1c-136df58d09c8	f3f6c6d563a13ed5020f706cb76fa802543a1803494ce71803a23f8f5d07a2cde3171d9039801dd9	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 20:27:57.723+05
e5253328-0b47-4007-9d58-447d9b890005	9efb84545c5c984184ae5bb56e16b396691b4c9b380f81d31d54c599b28c07260950aaefa964094d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 20:47:39.557+05
c76f5842-0d60-41d3-90af-2903ce43f419	7d3663fcf6b4f6cefdcc7d4e4e35eed7797537a0ede934db55d3da66d802dd1710bfb18ba35d6e5b	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-13 21:57:34.931+05
e258e154-d6b6-49b8-b308-4479ff8b3be9	ea8393791fe7c9306159bf65d93820120dbe10d30497e0db46b64b0173e3cfc2edd9bc376753f1a8	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 13:46:37.782+05
a9b602c7-edac-46e8-89f3-3e095e501b28	85407a1e35681220f5fd66eaa7a1f29b9aa6871219d9f202680d4e03094644d656d266f31b71911d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 13:48:24.44+05
fd8e4b89-ce23-49b3-a35a-c881e65ce4c1	10c6bf9eccda326968bd2d212048fb1c9246395b0cb30939f19730d468b08ab645cade57226c0cdf	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 14:48:30.553+05
b1460e30-6d06-430c-8eb5-82added84c1d	20d0fe08893859f1aaae860898f91254c452d4cd86fac7b7ad9f184c63a49df1317ef619e9ffd7db	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 15:07:27.557+05
a1bf186e-7421-4636-aa05-89bd359fb4b4	196a0c2c109c1f8a53f73fd5ce26369822a7da6956cc8fae908b37f46f9e5a6a30aef361cb911fc8	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 15:53:16.888+05
3fee5957-c952-422d-b48a-3eeef76c9c72	69d76d8e99348c180a4d781dd97c0048c08b95dcb70332abd7abaeb121fbf1c37381a31893465a6d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 21:12:59.182+05
0ddc6691-e2fb-4c27-8b4b-fdace9b673c3	3958b83d2756d97b7e9eb9048620f02fcbad49cc09c13d9a3c738b55721657ac128998ba0a4a4d09	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 21:14:02.43+05
b5f45ac5-b04e-4b16-be7d-28acdf8ef9b6	f6b1d738d02b63dc2f14e1e388c4187b7c8e12e2a4d2d5b198f693357e46f452e2d5737df45e6da8	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 21:19:35.555+05
e27f00bf-b927-4509-a39c-92b946bb848c	4f9c6d545c525782afec14768739410f7d09a3871b7a6cbfdb307a334746005285aa74b61785ec60	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-14 22:57:53.077+05
218de6aa-4fb8-4be6-812a-065eefdeee3d	abe500fbd53226beac5fdb282d6d43e7ccd57d795b4872e95bcfdf7e5761c995037df470acf4b1ae	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-16 21:43:13.71+05
2e95c826-5c41-4c99-8b3f-4baca05867d5	8432eca7bc8f4890ec90c03ad22d092c2fb0f4d182f3102153eb95cf6b3bdc942a8e6154809329a3	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-16 23:01:38.455+05
98d5a536-2660-4cc3-9f56-1456c83f1c05	493096a78c38fa5cf0f2791cbed42820ba293a6d440f8f522286e371da89bdc3fce4ef23452f58e7	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 00:02:00.485+05
a3abc0b0-0cbf-4560-9a9e-30385d6580fc	56d04620540bc3dda64b6050d7724d0124b28fa3d119eb89a6ad0f8f5b43225d49d55cd7f94fd52f	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 15:35:13.731+05
09591984-6b73-48c9-911e-b82bf2b5692c	c91dad8fff44892cdb2aad140bb4460d701544c6d1d7554f673e14e221d77a970a211df5ae88cb35	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 16:45:12.538+05
c0707c2e-fa95-41b5-abee-daea013aa81d	3d1d804b823267c09705ec6a6e89c67f3fe5614f1f7b9789957ad64802cba09891d60c2141126bc1	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 17:55:15.171+05
029fceaa-21ec-4b44-bf8f-c954120a8d9f	01fb3c9655aa7c15311f6b29c787c923012ecef2217f22eacb92428cc2973ad6d1f78b9f8a1ff78f	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 18:02:37.165+05
38b53395-a634-4dbc-b499-276c2f0ed508	a091bc9b9b94b0a31efe7300cfb81f3977c7d90fcd0537425555c26e5dea9151c3f5eafa0c1f3b09	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 19:40:26.593+05
7f90d5ca-c91e-4764-9f30-762485a103ee	fd565d54ae3f2b779a177b27fb1f2edd2836cae1f2191a5428dbcc567a09cafd103118a43aceffaa	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 21:35:05.108+05
5e773deb-d112-4f74-b7e2-1692e7d56204	3dfc700e2dd29bb0a7c5e5875e7cee6b3aaa12b1f1c85395ba0d855aa227d67feb1331c6f7c14b44	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 21:59:28.781+05
6958ed16-8721-4e0c-91cb-de2d33fef7d3	5049b856aa435102fb9c5bd725671524aa4e43567c465478313f3bf25e0e093806a619f63645a1ef	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 22:35:19.952+05
191238c3-5cd0-4bf4-bef0-dcf2d3c94c99	7958732ff331d4a818b9ebc5b78f27f0bc15c3f10bc8921d95ec85f8b2671c8afc1fa5743fcb8b14	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 23:25:56.324+05
4b5093a9-3722-4461-a9b0-b4fb43c2a0ea	63a7383dd4ad601882119ea0a3057cfe6aeec7c63035d252c89d8b7d5f228959eb77e3c9efb274f4	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 23:26:08.812+05
199f0f2b-4cd3-4f4c-9a2a-3bf5d3c6499f	5ad1b8b99b415e26ae969746aba840547553ed9107473fef2169cb6cc51498637929fd28fbcef7b8	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-17 23:35:43.816+05
74607116-1e49-41db-a04b-4578250f78c6	346712958e4f5d624a2ebaaa70b336c79eb188989750779dce278b64096bfa0a1817cc74ac7c2b0c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 00:37:37.653+05
865878ac-e81c-4c65-b5be-b7e083f9e766	960d46d6e3374c3bd6e69faf74ef3d558ad9efdd7572f63c3d875cade7b7c11f6aca672a17612fe2	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 18:23:30.794+05
136b9935-4472-4277-8fef-2bbf4cd9cdcb	6e9b8850831a89dcf940d21e42659c3d354303565a743e1b6a9ad2c6f13c4dc3ff225c4545484612	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 18:36:59.647+05
55b5856c-3160-4a7b-a059-3dccf44b016a	dd8d73844cc320b0585256e97b2785c2ef1b06a1235987d87be4d9337f18a41faf174d7f6f723c23	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 18:43:35.791+05
583ab4a4-47da-44a0-88b3-8c768e76e887	b1405fcfee1176655542d5830ea8234ac7f172be8d24facf3400f6926cb0e35acc4c25ad51357777	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 18:59:51.84+05
161653d7-c919-4f18-b6f9-13387c59c8fe	979edbf077534f7296f4ea484fe5b40c0316412467d97aac2d4c5394df049ad00e35733d98384101	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:05:08.259+05
4329302c-8223-4aa5-9e02-31b04c55fb6f	f1dabe113374b5f84cfdd2a085a42a9e6a49050260299b824e7651f8f762201f8e1be6630bf9a296	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:06:25.176+05
ce438096-fbc0-4bc6-8a64-f65f82716168	f8fe21e898dc8b550658694706ca371dddbc6052bf48e433bf60f454f53a293449f904230ddda927	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:09:53.631+05
8e727e1f-b41a-4a82-bf79-3a7ea306a11b	f7f65eef09931bb1fc3449c9c0fde5308e19c2004ce49e4f50a547d4c53ef07aa76ca0ac348e2c1b	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:28:15.262+05
334c1c75-0cd8-45f0-aca4-30645f6ce212	56ad6b327c98ad6900c63d5685069405b27e8d9016356a869cba32a259c85438cd71ce4df9bff91d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:28:32.702+05
1d1514e3-9e0b-403e-bb40-20b841d5547b	7f3d144a83efdbd57072e228edd9ce29ad8bda2e31f3a5e95ce1d20e995498130f1560ececd5899c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:31:58.893+05
0d71f85c-dc0d-43a9-9f0f-43e1f355df82	4771a6e15e72d44a88276dd7d19f1b340de50d3216f7f36cb9c265871c6e2dbb73bf0d973dd21ae2	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 19:34:10.784+05
ab8dcde7-5b68-414a-9fcb-ee62921d9000	fbb327b7cb3320f980c1600e1e01e324e4c46350c4b41a40a29fb7c78b0b9524af89ac5372fbd66a	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 20:13:36.687+05
94a169dd-f644-47a6-bdc2-2a8a14f95ab3	d5939b5c1593f34e0da3c56ae51a51b8b1bc364ddcd4eb3d0e5dc2decfe9ed03ccd4d0f2cf5e5ed7	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-18 20:14:44.924+05
9e1c83f7-ca7d-4cba-b460-5cfe13bfaeab	1889f86590d28486bacdad8ae8b37128e9f771b113c4c435cd796d87fb54bd8faed7e26e4b45fd4b	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-20 17:30:36.676+05
3c82a427-7ebe-40b2-b1d5-db9c50a337d5	e9b61ef8b29b4c84722d69fd4ccfbb6d3ae8f20e4ec5d3983c232c0a30f859e0fcbbbd08fbcedfc6	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-20 19:46:01.954+05
9655eb7e-70cb-4f35-bd25-58514e3409de	91d754d781e4a3303afcf05862d189cab571232f33b37f8e52272eef9659253513c7ab86f2539fc6	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-20 19:50:09.522+05
a12e35f3-a6aa-48bf-ae6c-0247cc5ecde4	a2d87c12fc8579147d802a04ecd5fd08d2dc1b72de0b4907c7340d7e4e22e2c50b07dcb208364da7	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-22 01:48:01.583+05
00c18edd-1f7a-4dc7-b154-5f17b004e4fb	a50466296591abafe7695b723b0005f5e2a706defc73bd22f41c1a3dbe81671ddb0acaafec0df169	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-23 18:53:17.718+05
a454f35e-2848-4b9f-9e44-59627dcbf7c3	46424769593ef100b63572763a6beaa95b0648e6fa8b11841f730347253326db3f0d6e6d366cb774	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-23 19:30:18.616+05
c53248ad-9637-4457-aa4e-9123adad7d98	736abca43bf787457c34bd75e81d63d4ae5e020b911937461a80827cc81794a9d0cdb959918437a1	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-24 15:26:07.317+05
2cdbe3da-1df1-4fae-a0aa-895f574b18f4	546eb234173fca8e70cba65456c3b799347d4be2344ea6a840a6a8e22151a293f5b4182f9f5a0ec1	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-24 16:31:53.124+05
f3cab08b-4640-427c-b4a2-5e62b5900206	2e708389414aaf6a27fbb45b9312bd7f7af67064e6cb3ceb1b2067c764e9b41ed28d7a6b2484b06d	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-24 17:35:17.735+05
4277e120-1ae1-43de-8cd9-6a30b8cb67a5	180c6c9d11608b6f6a53ffa5c5062b4b218a75004bda2825b09f7da0ff259e7d6acceb988e7f1cd3	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-24 18:35:29.398+05
a4592eee-bad4-4b3c-8e70-441131bc9527	4a737327f7ecfc58fdc02aa05b46ce500bfa4e3f1f27375363a0ffda2fff39f232f9739a5c006db0	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-27 03:14:53.041+05
a12990f9-23d2-40e7-b712-17916f8a6cde	3a894503f67aa7ac12aade36869b4bf40d345128c99babe7d5b7fb8049e567d7f782e9c23c344e30	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-27 03:30:50.668+05
dc0a6d33-906d-4e4b-986c-7aa0b0926d2a	7b19b2e97d535076e876e3fdc652b7e1c72258da7dc8f7fc1e026baadcc83e07abc0532b26f6666c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-27 03:38:00.016+05
e01101ce-d407-4cca-9659-8671f88b256e	3837bb4416778d7d7813adae06d8fef069e6d0afdc648b2774c53c9cde928c222fcc0031b092a22b	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-27 03:58:10.452+05
1d24ef39-6a44-4b83-8043-da131a222d59	5d3409b9392b64cba130efead48e1ae74b8e7a05979c45b1b1f87edaea2b31e56bcf4d538f02e39c	1351927f-3781-468e-ae03-57b64c8559dc	2025-03-31 16:22:08.687+05
7c28d7d8-aa56-4b67-9a37-c5185f0d941b	1c776e6aff08829957a4c3d2b53dcbb18956baa19f74e33ed7d2df40df04ddb8b9357cb5e7cf71bd	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 01:47:25.215+05
f3d327b1-760f-425f-a19a-e108e85b18f5	29ab4f95bf5c24df17790a1c5828574f34175e8941ae7df8d7429ccbe3231b8084e7ad9ca95c5e3f	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 02:44:34.913+05
4d9c9d39-afbe-44db-8346-572229c02f3a	dd190d0840ca5a49298658c9f28c8e7cd0561ccf3a8a8e67ee8ddb98964a5441ec43d67973ecdda2	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 03:01:47.406+05
fe280738-7880-471a-866c-a14dbcc30d22	922c4be3b8976066ae93f5a13a5968634ecbbd832914b66c348acd5aee7be39b1c6ad895879f0ba4	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 03:50:38.118+05
d7e7acff-714e-4c5d-b267-b4ce1a8eb02c	94f53ec51d82f60bb478d23498321a4036c8f718a9cc1c0cbf2855bec55ce3361748627bc64c78a4	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 04:09:39.159+05
9b49df99-d98a-49b0-96d0-5741509382b0	e41e6b8915da17f3eacc0200ba4beeaec2c0597599ec50612e93b62060576df40cd321c19b0552b7	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 04:13:39.143+05
5f1766a4-38ec-4341-8aff-57f2444b0bb9	5922422f10699480b51168aa93958295169f3e2b009eb1b8c993e8939e56edd0a7d00135b84a2803	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 15:41:05.019+05
2bc8c9d6-988e-4e0c-9b18-96c558fe8276	3c19d6e650e1d9e4dfc0ac4795b75be3af0c3a57a0a8d099e6473e77975f39db40d2366a109c5d52	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 16:41:39.087+05
3cefab08-b424-4c4d-b7f0-b5cb0cc30fd0	7796340f70ac3e8e81faf039bfd8f54cdd62047f8582bfb7afdf864498de0317dedd96829aa05ba3	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 18:10:08.258+05
eddbef10-3862-455c-9103-6fb3bf1aa1f0	bf3c80d69932022e41ed1ca90da3dccdb9b0c8bee0156f52cd9f48bade3f4e0223f1968d676c7d34	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 19:45:11.458+05
ff5a3069-678b-49b9-ac4c-2cf4c386cef4	6ff05eca3758cfa7ed8266816405a8ccf8e3a9573f7132eaeaa5b20f53805a8d81b966a248aaf62a	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 22:05:37.091+05
a61683c7-6d29-41be-a39c-fbec186e3af3	aa0e38b4f47241bafabe7fd3590d52f0e9a6369a8e40496f35d9010d4cfb90e6e4a2b4200283e3cb	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-01 23:08:23.799+05
41d3b4da-bd88-4807-802e-31091956b7b3	42abec81bee75251ba3ddc1ee052bf0b7d83a77499033479aee8b13114b38091f83388e88d9f1694	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-22 19:35:39.182+05
b1691eb5-bc5f-435a-92db-f01acbb3ed25	5959edc5cb28fddcb6f85cf016232b2709435e1c305dbe2921376ce2619b97a95f86f8c324a4ac5d	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-22 19:39:39.375+05
5f46d5a6-8f56-4a26-aee3-524cac28c590	0e58d750f82945f23b2c712fb4b8bb3b1329055846e4153872647ea671ef586dbb82ee9aaf0ee358	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-22 19:46:08.529+05
7df32f3a-b0eb-44f2-8b85-b4145326eb09	b5e5734e7782850e3540bdd50b605d506d349a1cec780fdf40b4bb3d91366d1b2b4897fdc10094ee	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-22 19:48:47.39+05
055a0829-dbea-4d9b-b187-4a1a129adf3d	2c7b0a027c0b3f5f2a644961cee4978a1c1502a4860327b907962ed6fe5e448363903d2f4098c3a4	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-22 20:05:43.173+05
286f027b-7a76-47da-a475-030a0353fbb2	ee779c2ff056e216c1d2cec78dc46600d54b76df4ca7c009a10ed6fe68c9ca75893cee8bed248a82	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-22 20:40:37.369+05
9df7e925-bec6-47c4-b459-40e12c6fba1d	3f1f3ec4b09830803b529db2535e3519996b0d695d5b6c96d15b7c586cee4b8d9a66e80f3b61f407	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-27 06:30:21.713+05
6f1dd4c2-0beb-42d0-bef6-e3f78718da29	50755c48f7128c121ac22e4f2712558be706ad83060b66e48ab16916044d87c45e8e352c3f3fd7e9	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-30 19:31:12.361+05
1c32c791-dad5-4761-b37f-95dee6280d6f	7886ba360ffb754cd5f5c27a2d8c207dd44232e48da433c41fc951db2a3c23f712b7e28ba24d4197	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-30 19:35:59.547+05
d3ae18d5-d56d-441a-8c79-6b03b5470af6	9dadaf3908222ff9cee84126e582c7e84b9f963a2f88ae48e83ddaa278996b7c8cd731af5c6a0814	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-30 20:48:35.328+05
e7cc2190-ff8f-4544-a29d-058d735ccc46	0f5d639f6779e9ff7ba0972cb071869cf284b2de974e522bd611b89114ad1f9dc68b198bf3229f7c	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-30 20:58:16.034+05
0afe7fc0-6664-459c-a0de-87abd9ec8d61	07c7d86787197e05379a849bb33dbeeaf5db7ecb4452cc7a3e3d26d533b41db3b7386f0f585243f0	1351927f-3781-468e-ae03-57b64c8559dc	2025-04-30 21:08:52.906+05
944798e9-9c07-4a41-b38b-6c47fc9b7eb6	ee7c8a6a34cd35b858119fe5f57898887ce908ed9e21a45599f2d469de18c55acaaec7bb93f73894	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-02 17:22:08.223+05
b2ee1a3d-5531-4fa5-90ee-9b521adeafd7	63974524c918be64498ea4d2fd88892f15064a61d4946d145cec1c200c391c56bb8fbb6b3b981875	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-02 18:10:43.35+05
a4400dc5-9d80-4316-bb06-8d4286b37c07	1e00415a97e6d09cc816b45db2f4a490cfce98158b4eaff96c2e4cc751d33dd3821c760d8a5f2b3e	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-09 00:41:46.533+05
3f92a417-8884-4049-90ac-8c7d0c418dfa	e7706bde1f4817de8c217f73ce2ccafca01af5ff0d26be46b3c474ea9aa530e2e987773c075ea403	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-10 03:52:03.751+05
7bea1bfe-a616-4cd2-b083-6923b25ed9d8	8c48c6e35b73447a3b214bafdcf60662ba64cd8c4ed108fff7e0c6e6adf740b6b84928bfc8aa1255	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-10 04:51:22.37+05
225cc8c5-9155-411c-bf25-935f69cea63e	90b61fac91ea205ab782527c48c600f6e01f88f975cd58ce5e3125d459c64432fe8e7a142b73671c	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-10 04:54:38.493+05
a5139baf-f278-4cc2-9579-ae370af5eb6a	def75b428c23657fe3f414321cfce001dd6b0f81185c8b8f1420c1f825f9eeffdb0878711b2af353	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-10 05:42:50.322+05
aafe29af-ac23-4e3a-857d-732d3483be91	e9dda1689638c3af53c8d5c18e90f6fdd7b80947bf3452c5eb00e21707960acd271183f2aa077638	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-10 05:56:28.112+05
572efb7e-5fff-4ba6-9b12-645021d5d894	eb484e18473d9ffd02f17fba32975511d104057553b5009372a1415a92b59a34f592e618f35b96a7	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-10 06:59:28.668+05
a6690d46-99a2-49d5-8452-389ea9c1d685	1951937cf32f10128174d4879482a5b83b14ee25c2daf5abc1b8d762dad9e831502792652f00c039	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-11 04:16:38.232+05
43725a00-cf9a-41e8-94ed-e1f8183556e4	0d0d5f6d8b1535e50bed7aca546e4e2860e6e03879cabe33b604b097fa960630439bfce9f63f47ee	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-11 05:15:23.526+05
cce3b19a-d0d3-4e70-a799-e7f97cc2593c	d35719347f80ce5bd816c8285cd3f9c12b45b19485a1813ec4494181675080dadf69aba702b3a30b	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-11 05:16:45.79+05
13a68e6a-a983-4588-bb70-628dad5f897a	10cf57c092f0847e855897c1a6fc95fd4a4e3d3b414eb6abfa074836458986e99d9555d7fa174c0b	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-11 05:26:04.414+05
c312cdb4-de62-4f2d-9a6a-088eb70424f8	2a6eb0aefe026d0321ff38d56aebae1f52436d117f7f53a6f7448c32aa388a331ba5954008f7ec4e	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 02:13:53.289+05
95be5036-a1f1-412e-8168-65f82b6c3096	2a555c0e27248b7e963c9481241a5d87b544933bf0a5277885824e41f36ef6d651203fd4ca6ec4ad	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 02:55:09.646+05
f68852d3-b5b4-4f55-bf6a-b1c50a835c72	cfa6694626ce9d1e9d7145946c97d5a3f572a9f026c7b1d4f43a6a4a2d87cb70f9aa5fc111e31ca2	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 04:11:13.728+05
1d5171eb-1ea3-4831-8904-c5b96beb66af	cd3a200b75c150ed1eef85d8d33dffebc113420f82f4b8ab56e8afabb612cf0139532803c62669a2	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 16:26:58.364+05
4639c1c0-56a5-47ab-9c89-6eacbb8ce763	31c6a278a2cce2034788ce05b79c2e30ae474efa9bb77ac21cec0c1ec2f7b41ea71cce932254d049	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 17:27:57.113+05
841cc053-1e90-4c52-bb0a-60170dd27312	5255a790fdfc9fd96825cae653088aee13c9f29b357106b21b934e67de8cf80b76d8a8888d2ce043	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 17:47:24.512+05
e3f5855f-34b2-4aae-a593-ae84512220de	5f37b49da16090aeb47b13e5eb2ae1c92981488d5bedb88e002733eea3abfb7e98292b3564f57863	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 18:41:16.98+05
be887095-1579-4cda-b72a-d29825b30a49	621a923b8904ba891bdc280c44fd4f8d109b1fd0491b70c161389930d75035e48043c4b06e3dd26b	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 19:41:49.479+05
6332cc41-b223-4bc8-8613-bccb21d6efd5	f6b411f43919e2effadd2994d0574846656fff524d5832451c160c773e849ddac064bec491d657ea	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 20:44:26.405+05
df26279c-dcd3-4dd9-a14f-f20470a08552	c6d417053fac92ada6ede7dd29315a4fa49ccd5832cad63ece3e300747e89688d789a1c62efd3da0	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 20:55:52.171+05
305cb481-82ef-4282-b4f1-c1d16172b184	3dbe53b7e4219fd78a065a22d4ab4095910d76131097a7556b475c19e0eca51a981bfdbaebf114b8	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 22:03:17.093+05
1a9fea88-b904-42ad-94a2-0562adeb1d52	4478fdebe23bd98a06064d5bf780529cc0efdfcac7f565b9e82b0464d1e0e7c56945336bce5debc1	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-12 22:08:08.929+05
86770bdb-d933-44fe-b135-fc328ba6c291	e8ffb39250901dbde7503d217b25a0b5ffcc077dfec0c2c2098a7c9fa9da5cc2be80d9cfd7de2073	1351927f-3781-468e-ae03-57b64c8559dc	2025-05-13 00:45:49.514+05
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, slug, permissions, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: subCategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."subCategories" (id, "catId", name, slug, images, "userId", status, "createdAt", "updatedAt", "deletedAt", description, "productCount") FROM stdin;
1c45ccfe-dbff-4d93-a68a-6e753bef9ba7	066a4372-3fa3-45f9-9802-15fe87865628	Compact Sedans	compact_sedans	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:15:48.876+05	2025-03-02 20:06:35.161+05	\N	{"blocks":[{"key":"dvlsa","text":"Small, fuel-efficient sedans ideal for city driving.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
0d9339c8-c768-4528-953d-3a2a851185e4	066a4372-3fa3-45f9-9802-15fe87865628	Full-Size Sedans	full-size_sedans	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:16:03.97+05	2025-03-02 20:10:02.105+05	\N	{"blocks":[{"key":"9m335","text":"Large, comfortable sedans with premium features","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
e850048e-0e10-4ef3-a603-a3ecff2dd05a	aa29258b-faec-4ad3-bafb-ba2e61b1fd4e	Battery Electric Vehicles (BEVs)	battery_electric_vehicles_bevs	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:16:30.047+05	2025-03-02 20:14:13.52+05	\N	{"blocks":[{"key":"7i7s1","text":"Fully electric vehicles powered by rechargeable batteries","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
fb1bf9ea-fc06-4ff8-bb48-ba19fe5bd46f	aa29258b-faec-4ad3-bafb-ba2e61b1fd4e	Hybrid Electric Vehicles (HEVs) 	hybrid_electric_vehicles_hevs_	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:17:02.466+05	2025-03-02 20:17:03.862+05	\N	{"blocks":[{"key":"fdsjs","text":"Cars that combine a gas engine with an electric motor but do not plug in","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
cfa109ec-576a-496f-bc75-256397b604b0	25367552-1194-459f-8908-e24587ee4e24	Compact SUVs 	compact_suvs_	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:17:34.402+05	2025-03-02 22:10:34.556+05	\N	{"blocks":[{"key":"4vn5r","text":"Small SUVs with urban-friendly dimensions and versatility","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
43d2bdb6-4348-49ef-b397-f0c8c061e12a	25367552-1194-459f-8908-e24587ee4e24	Off-Road SUVs	off-road_suvs	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:17:54.994+05	2025-03-02 22:14:02.185+05	\N	{"blocks":[{"key":"cdkrq","text":"Designed for rough terrains, featuring 4x4 capabilities and rugged suspension.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
d524aee6-3ce8-4640-913f-da1176a19689	115c75bd-8a4b-4396-a368-48edc6ac1529	Brake Pads & Rotors	brake_pads__rotors	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:18:25.197+05	2025-03-02 22:18:10.966+05	\N	{"blocks":[{"key":"e9s3j","text":"Disc brakes, ceramic pads, and high-performance rotors.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"e904p","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
731f909b-8918-4923-9f94-6543e8033b41	115c75bd-8a4b-4396-a368-48edc6ac1529	Brake Calipers & Hardware	brake_calipers__hardware	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:18:50.012+05	2025-03-02 22:22:16.105+05	\N	{"blocks":[{"key":"5aqe4","text":"Performance calipers, master cylinders, and brake lines.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
0eb0be63-e5c8-4fa7-8707-6c10fff4cdb0	1d85b77a-cf4f-40ad-ab6a-d313c8dedb3a	test	test	{"uploads\\\\1739028254741-jarame.png"}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 20:05:00.508+05	2025-03-02 16:18:58.024+05	2025-03-02 16:18:20.041+05	\N	-4
fd202ea7-81cf-4dfe-8ec1-22239862a5bc	c15032d3-148b-4ab4-801e-15cf8c8c2a1a	Engines 	engines_	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:14:22.816+05	2025-03-02 19:56:52.604+05	\N	{"blocks":[{"key":"1o67j","text":"Complete engine assemblies for various vehicle types.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
0718c1bf-aafc-4bb0-8189-6e974f5b221d	c15032d3-148b-4ab4-801e-15cf8c8c2a1a	Transmission Systems	transmission_systems	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:14:41.842+05	2025-03-02 19:59:44.791+05	\N	{"blocks":[{"key":"9jqap","text":"Automatic and manual gearboxes, clutch kits, and torque converters","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
34651f70-0d66-4b70-8289-fb7c269da073	c15032d3-148b-4ab4-801e-15cf8c8c2a1a	Fuel Systems	fuel_systems	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:15:18.369+05	2025-03-02 20:02:10.625+05	\N	{"blocks":[{"key":"bijkv","text":"Fuel pumps, injectors, carburetors, and fuel tanks.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
67de5196-e4f0-4add-986b-428841557e68	30e41de0-a58b-4216-b133-e008b74e48ae	All-Season Tires	all-season_tires	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:19:13.03+05	2025-03-02 22:30:03.321+05	\N	{"blocks":[{"key":"2p0sd","text":"Tires designed for year-round performance","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	2
1eef36c2-a2ef-4d6e-addb-c14128f432cf	30e41de0-a58b-4216-b133-e008b74e48ae	Alloy & Steel Wheels	alloy__steel_wheels	{}	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-03-02 18:19:41.577+05	2025-03-02 22:39:19.673+05	\N	{"blocks":[{"key":"f7791","text":"Custom and factory-style wheels for different vehicle models","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "firstName", "lastName", email, "permissionId", phone, password, status, "createdAt", "updatedAt", "deletedAt", role) FROM stdin;
1351927f-3781-468e-ae03-57b64c8559dc	Harriy	Jordan	admin@londontechnicalsupply.com	c86e62e6-8c7c-435b-a7ef-b083cf89edfd	3123456789	$2a$10$4k8PFOQ4rqSTfAM0pRXSPurhdi8UWk2J/GqpIUJ5em5lavSTRYVfu	t	2025-02-04 23:27:22.349+05	2025-02-05 00:09:03.074+05	\N	admin
addaa6da-18cc-4b4d-9b51-1b8acb5568fc			finanace@londontechnicalsupply.com	d760833e-e490-4f7c-b2cc-1c4ba4a3abab	\N	$2a$10$VL3KOVygd8DDTanl2MpaFupVj2sKbScPvnHNUx5TRlJWNwdvsXAXy	t	2025-02-05 00:29:42.725+05	2025-02-05 01:03:54.27+05	\N	user
fc8dac33-2be7-4c99-b636-91f8d94cf0e9			test1@londontechnicalsupply.com	b0a84451-d69a-4cab-9fd1-0cc9928e9d06	\N	$2a$10$IGinJhFIxSYMnyCWMMQWS.8WcjxvwuQ7KwyOBz9LauA1IjVGduUF.	t	2025-02-07 02:54:45.668+05	2025-02-07 02:54:45.668+05	\N	user
46330db2-3f7d-4a3e-9db5-55d2d90f92be			test2@londontechnicalsupply.com	0677c613-9fbc-4684-b987-a53dbaba4d71	\N	$2a$10$A8FBeoWFXtkGrh6N3REIL.xXmheTLQ/4ttFgmC/5EJUxHtOc4NJz6	t	2025-02-07 02:54:54.049+05	2025-02-07 02:54:54.049+05	\N	user
3e6235a0-bc00-4391-86e7-9d45c90535e2			test3@londontechnicalsupply.com	d08dbf05-0a7c-49da-b3aa-49ca69f9edce	\N	$2a$10$oUmiCkGfukQzP14sIsBc5..E5NLeo.BtY9N4eFjPWpfIeeeGcMQAm	t	2025-02-07 02:55:11.775+05	2025-02-07 02:55:11.775+05	\N	user
a6d490f0-8eae-4e19-90f1-6edbf4b6de66			test4@londontechnicalsupply.com	ad1c4405-1de7-4262-a482-b518cefcb72b	\N	$2a$10$Pek4qY3KTiTVazl/BZ.vPuoVe5jgFk9qP3sF2dg44p75ISyXuiTaW	t	2025-02-07 02:55:16.575+05	2025-02-07 02:55:16.575+05	\N	user
93cfda2a-c269-4986-84c8-931aefe066c8			test5@londontechnicalsupply.com	526891f5-151b-4be6-8757-73a14a16b2f0	\N	$2a$10$A/SVY/679efSU8R34EaJTukC0I8d8XyOJ3puxWa8EiGYVBNiRVdxm	t	2025-02-07 02:55:28.283+05	2025-02-07 02:55:28.283+05	\N	user
52e0b066-6930-417a-b5e7-61b4b9c6c255			test6@londontechnicalsupply.com	590264af-c47b-47ba-bc18-575b379141e6	\N	$2a$10$axM.f8UdZKORmBtfGLs.fuakdfnhndCbgDPTDgSmjmFKKUTCYbjqG	t	2025-02-07 02:55:36.107+05	2025-02-07 02:55:36.107+05	\N	user
5215c792-d1e9-4887-adc8-9433daaa758f			test7@londontechnicalsupply.com	7ba9cd25-c0eb-4472-a393-72de01dde92d	\N	$2a$10$RT7LHs/HtF2rXDey/ycAE.BM/LNto7KpTLITLwgh3AJUOt7vR.35W	t	2025-02-07 02:55:42.14+05	2025-02-07 02:55:42.14+05	\N	user
7d5a87b5-b217-4aa9-b216-c07c9d061f30			test8@londontechnicalsupply.com	62cfdcf1-ae88-4355-bab7-3c272ca81266	\N	$2a$10$u1dbe5hpShxL6WtBSoiTcuJvRv1pvs5kg38jV2Jusj/e0qi8JrK5e	t	2025-02-07 02:55:48.423+05	2025-02-07 02:55:48.423+05	\N	user
d45d164d-659a-485f-9d4f-fecb14e7c8cb			test9@londontechnicalsupply.com	4388a8ad-b727-4f5e-9bd5-d508457b21d6	\N	$2a$10$1q6OvyJi2Sfs4PZKIE3P7u6R2EYXvkcO8Sxe.F9GqahtTiswGaLkS	t	2025-02-07 02:55:55.298+05	2025-02-07 02:55:55.298+05	\N	user
eabe390b-fc29-4de2-8b29-5532ccdc4ec3			test10@londontechnicalsupply.com	6e82b702-3797-4de8-aeb5-bb8796beec9d	\N	$2a$10$okUQbKrLB3bmdXZzGHlMWev8BYUdhuJ2GWq6dNtipp3l.YJ.EnsI2	t	2025-02-07 02:55:59.482+05	2025-02-07 02:55:59.482+05	\N	user
eba990df-50a2-47bc-8f9b-314fe73f28b6			tech@gmail.com	49f24362-5a45-438f-901c-1da835ead61b	\N	$2a$10$sYrbTcCNTTMDRXurtwYwROUs/BCz8oFAKUPxAcKHC.N.B7KmRG80m	t	2025-02-08 19:13:13.422+05	2025-02-08 19:13:13.422+05	\N	user
\.


--
-- Data for Name: vendor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor (id, "firstName", "lastName", email, "companyName", phone, "streetAddress", city, state, "zipCode", country, "userId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
f6e6305f-cd87-47dc-9c3c-7d132b0595d1	Sameer	Shoukat Ali	sameershoukat000@gmail.com	Toynie.pk	03072283370	Shah Faisal Colony KARACHI	karachi	sindh	75230	PK	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-15 18:06:44.007+05	2025-02-15 23:47:52.944+05	\N
a34c9113-8def-4b05-86d3-2f6d7515cdc2	Zain	ali	zainali@gmail.com	TACHE	1234567890	1612 Bingham St UNIT B	Houston	sindh	7700	PK	1351927f-3781-468e-ae03-57b64c8559dc	2025-02-22 15:33:10.891+05	2025-02-22 15:33:10.891+05	\N
\.


--
-- Data for Name: websites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.websites (id, name, url, logo, "userId", status, "createdAt", "updatedAt", "deletedAt", description, "productCount") FROM stdin;
298c0b96-fda9-4b2e-aaa2-858e1660242b	test	https://design.scripttopsolution88.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:12:14.388+05	2025-02-07 20:12:14.388+05	\N	\N	0
85e874cd-c34e-46a6-867f-d3b8b3198c3e	server	https://shop.webmindsstudios555.com/	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:14:42.804+05	2025-02-07 20:14:42.804+05	\N	\N	0
d17b6ba2-cef3-4579-a1fe-6a0862964a0d	server	https://shop.webmindsstudios559.com/	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:16:30.449+05	2025-02-07 20:16:30.449+05	\N	\N	0
7c87c9cd-168e-4f0e-9da5-5da56a40796a	test	https://shop.webmindsstudios588.com/	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:17:56.505+05	2025-02-07 20:17:56.505+05	\N	\N	0
87b2b00b-d256-44d9-b218-8bd25b417b3f	test	https://design.scripttopsolution99.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:18:53.864+05	2025-02-07 20:18:53.864+05	\N	\N	0
8ab75ff1-2aac-4580-a485-1fe18541e7f1	test	https://shop.webmindsstudios886.com/	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:29:29.439+05	2025-02-07 20:29:29.439+05	\N	\N	0
5e3f6af0-3726-4a53-bf23-ffc0e29b37cd	test	https://design.scripttopsolution8888.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:39:05.803+05	2025-02-07 20:39:05.803+05	\N	\N	0
27ee8b5d-b912-4286-bb06-f2b118b53773	test	https://design.scripttopsolutio8882.com	uploads\\1738949646061-2.png	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:40:39.516+05	2025-02-07 22:34:06.086+05	\N	\N	0
6a492bcc-c64e-4904-82ff-4c637ad99ffa	test	https://shop.webmindsstudioss.com/	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:04:19.61+05	2025-02-08 00:00:31.148+05	2025-02-08 00:00:31.148+05	\N	0
e881e6bb-7da2-4dff-b1f9-c0291b623f67	test	https://design.scripttopsolution9.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:11:49.219+05	2025-02-08 00:01:12.498+05	2025-02-08 00:01:12.497+05	\N	0
41b54fdf-d8c8-4abe-9779-2f93f858fc38	test	https://designs.scripttopsolution.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:02:58.335+05	2025-03-02 16:18:58.024+05	\N	\N	-2
0479d6e2-9dee-40c8-ab65-9343b4c9cd45	test	https://design.scripttopsolution.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 19:44:09.315+05	2025-03-02 19:56:52.61+05	\N	\N	1
3b980e63-d9ea-4d0f-b953-84fb08ff0bf2	ABCD	https://abcd.com	uploads\\1738940417349-Untitled design.png	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:00:17.462+05	2025-03-02 19:59:44.797+05	\N	\N	1
ecbe0cd8-9ba2-4226-8a39-1905a6115ad3	test	https://design.scripttopsolution852.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-08 19:13:49.01+05	2025-02-08 19:13:55.309+05	2025-02-08 19:13:55.309+05	\N	0
828fa8a1-2314-417d-9546-8c97926ff8cb	test	https://shop.webmindsstudios.com/	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-07 20:03:16.216+05	2025-02-22 18:09:45.169+05	\N	\N	0
84597e99-b13e-4bbe-9912-e862b1e92d64	LTC UAE	https://ltcuae.com	\N	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-22 18:34:25.71+05	2025-02-22 18:35:43.529+05	\N	\N	0
8e4c7d45-a9ba-4ada-a88d-ae73424e11f1	LTC	https://ltsuk.com/	uploads\\1740228671056-logo.png	1351927f-3781-468e-ae03-57b64c8559dc	t	2025-02-22 17:51:11.143+05	2025-03-02 22:39:19.676+05	\N	\N	11
\.


--
-- Name: accounts accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- Name: accounts accounts_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key1 UNIQUE (email);


--
-- Name: accounts accounts_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key10 UNIQUE (email);


--
-- Name: accounts accounts_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key11 UNIQUE (email);


--
-- Name: accounts accounts_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key12 UNIQUE (email);


--
-- Name: accounts accounts_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key13 UNIQUE (email);


--
-- Name: accounts accounts_email_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key14 UNIQUE (email);


--
-- Name: accounts accounts_email_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key15 UNIQUE (email);


--
-- Name: accounts accounts_email_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key16 UNIQUE (email);


--
-- Name: accounts accounts_email_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key17 UNIQUE (email);


--
-- Name: accounts accounts_email_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key18 UNIQUE (email);


--
-- Name: accounts accounts_email_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key19 UNIQUE (email);


--
-- Name: accounts accounts_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key2 UNIQUE (email);


--
-- Name: accounts accounts_email_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key20 UNIQUE (email);


--
-- Name: accounts accounts_email_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key21 UNIQUE (email);


--
-- Name: accounts accounts_email_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key22 UNIQUE (email);


--
-- Name: accounts accounts_email_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key23 UNIQUE (email);


--
-- Name: accounts accounts_email_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key24 UNIQUE (email);


--
-- Name: accounts accounts_email_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key25 UNIQUE (email);


--
-- Name: accounts accounts_email_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key26 UNIQUE (email);


--
-- Name: accounts accounts_email_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key27 UNIQUE (email);


--
-- Name: accounts accounts_email_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key28 UNIQUE (email);


--
-- Name: accounts accounts_email_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key29 UNIQUE (email);


--
-- Name: accounts accounts_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key3 UNIQUE (email);


--
-- Name: accounts accounts_email_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key30 UNIQUE (email);


--
-- Name: accounts accounts_email_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key31 UNIQUE (email);


--
-- Name: accounts accounts_email_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key32 UNIQUE (email);


--
-- Name: accounts accounts_email_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key33 UNIQUE (email);


--
-- Name: accounts accounts_email_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key34 UNIQUE (email);


--
-- Name: accounts accounts_email_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key35 UNIQUE (email);


--
-- Name: accounts accounts_email_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key36 UNIQUE (email);


--
-- Name: accounts accounts_email_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key37 UNIQUE (email);


--
-- Name: accounts accounts_email_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key38 UNIQUE (email);


--
-- Name: accounts accounts_email_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key39 UNIQUE (email);


--
-- Name: accounts accounts_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key4 UNIQUE (email);


--
-- Name: accounts accounts_email_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key40 UNIQUE (email);


--
-- Name: accounts accounts_email_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key41 UNIQUE (email);


--
-- Name: accounts accounts_email_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key42 UNIQUE (email);


--
-- Name: accounts accounts_email_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key43 UNIQUE (email);


--
-- Name: accounts accounts_email_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key44 UNIQUE (email);


--
-- Name: accounts accounts_email_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key45 UNIQUE (email);


--
-- Name: accounts accounts_email_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key46 UNIQUE (email);


--
-- Name: accounts accounts_email_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key47 UNIQUE (email);


--
-- Name: accounts accounts_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key5 UNIQUE (email);


--
-- Name: accounts accounts_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key6 UNIQUE (email);


--
-- Name: accounts accounts_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key7 UNIQUE (email);


--
-- Name: accounts accounts_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key8 UNIQUE (email);


--
-- Name: accounts accounts_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key9 UNIQUE (email);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: attributes attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT attributes_pkey PRIMARY KEY (id);


--
-- Name: attributes attributes_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT attributes_slug_key UNIQUE (slug);


--
-- Name: catalogs catalogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_pkey PRIMARY KEY (id);


--
-- Name: catalogs catalogs_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: gallery gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery
    ADD CONSTRAINT gallery_pkey PRIMARY KEY (id);


--
-- Name: order_history order_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT order_history_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_orderNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key1" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key10" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key11" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key12" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key13" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key14" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key15" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key16" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key17" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key18" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key19" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key2" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key20" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key21" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key22" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key23" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key24" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key25" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key26" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key27" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key28" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key29" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key3" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key30" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key31" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key32" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key33" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key34" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key35" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key36" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key37" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key38" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key39" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key4" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key40" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key41" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key42" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key43" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key44" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key45" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key46" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key47" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key5" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key6" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key7" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key8" UNIQUE ("orderNumber");


--
-- Name: orders orders_orderNumber_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_key9" UNIQUE ("orderNumber");


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transactionId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key1" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key10" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key11" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key12" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key13" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key14" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key15" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key16" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key17" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key18" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key19" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key2" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key20" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key21" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key22" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key23" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key24" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key25" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key26" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key27" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key28" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key29" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key3" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key30" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key31" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key32" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key33" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key34" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key35" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key36" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key37" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key38" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key39" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key4" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key40" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key41" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key42" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key43" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key44" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key5" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key6" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key7" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key8" UNIQUE ("transactionId");


--
-- Name: payments payments_transactionId_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_transactionId_key9" UNIQUE ("transactionId");


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- Name: product_codes product_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_codes
    ADD CONSTRAINT product_codes_pkey PRIMARY KEY (id);


--
-- Name: product_pricing product_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_pricing
    ADD CONSTRAINT product_pricing_pkey PRIMARY KEY (id);


--
-- Name: product_quotes product_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_quotes
    ADD CONSTRAINT product_quotes_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: product_tags product_tags_image_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_image_key UNIQUE (image);


--
-- Name: product_tags product_tags_image_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_image_key1 UNIQUE (image);


--
-- Name: product_tags product_tags_image_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_image_key2 UNIQUE (image);


--
-- Name: product_tags product_tags_image_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_image_key3 UNIQUE (image);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (id);


--
-- Name: product_tags product_tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_slug_key UNIQUE (slug);


--
-- Name: product_tags product_tags_slug_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_slug_key1 UNIQUE (slug);


--
-- Name: product_tags product_tags_slug_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_slug_key2 UNIQUE (slug);


--
-- Name: product_tags product_tags_slug_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_slug_key3 UNIQUE (slug);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: products products_sku_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key1 UNIQUE (sku);


--
-- Name: products products_sku_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key10 UNIQUE (sku);


--
-- Name: products products_sku_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key11 UNIQUE (sku);


--
-- Name: products products_sku_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key12 UNIQUE (sku);


--
-- Name: products products_sku_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key13 UNIQUE (sku);


--
-- Name: products products_sku_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key14 UNIQUE (sku);


--
-- Name: products products_sku_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key15 UNIQUE (sku);


--
-- Name: products products_sku_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key16 UNIQUE (sku);


--
-- Name: products products_sku_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key17 UNIQUE (sku);


--
-- Name: products products_sku_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key18 UNIQUE (sku);


--
-- Name: products products_sku_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key19 UNIQUE (sku);


--
-- Name: products products_sku_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key2 UNIQUE (sku);


--
-- Name: products products_sku_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key20 UNIQUE (sku);


--
-- Name: products products_sku_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key21 UNIQUE (sku);


--
-- Name: products products_sku_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key22 UNIQUE (sku);


--
-- Name: products products_sku_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key23 UNIQUE (sku);


--
-- Name: products products_sku_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key24 UNIQUE (sku);


--
-- Name: products products_sku_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key25 UNIQUE (sku);


--
-- Name: products products_sku_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key26 UNIQUE (sku);


--
-- Name: products products_sku_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key27 UNIQUE (sku);


--
-- Name: products products_sku_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key28 UNIQUE (sku);


--
-- Name: products products_sku_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key29 UNIQUE (sku);


--
-- Name: products products_sku_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key3 UNIQUE (sku);


--
-- Name: products products_sku_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key30 UNIQUE (sku);


--
-- Name: products products_sku_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key31 UNIQUE (sku);


--
-- Name: products products_sku_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key32 UNIQUE (sku);


--
-- Name: products products_sku_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key33 UNIQUE (sku);


--
-- Name: products products_sku_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key34 UNIQUE (sku);


--
-- Name: products products_sku_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key35 UNIQUE (sku);


--
-- Name: products products_sku_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key36 UNIQUE (sku);


--
-- Name: products products_sku_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key37 UNIQUE (sku);


--
-- Name: products products_sku_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key38 UNIQUE (sku);


--
-- Name: products products_sku_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key39 UNIQUE (sku);


--
-- Name: products products_sku_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key4 UNIQUE (sku);


--
-- Name: products products_sku_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key40 UNIQUE (sku);


--
-- Name: products products_sku_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key41 UNIQUE (sku);


--
-- Name: products products_sku_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key42 UNIQUE (sku);


--
-- Name: products products_sku_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key43 UNIQUE (sku);


--
-- Name: products products_sku_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key44 UNIQUE (sku);


--
-- Name: products products_sku_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key45 UNIQUE (sku);


--
-- Name: products products_sku_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key46 UNIQUE (sku);


--
-- Name: products products_sku_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key47 UNIQUE (sku);


--
-- Name: products products_sku_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key48 UNIQUE (sku);


--
-- Name: products products_sku_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key49 UNIQUE (sku);


--
-- Name: products products_sku_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key5 UNIQUE (sku);


--
-- Name: products products_sku_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key50 UNIQUE (sku);


--
-- Name: products products_sku_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key51 UNIQUE (sku);


--
-- Name: products products_sku_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key52 UNIQUE (sku);


--
-- Name: products products_sku_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key53 UNIQUE (sku);


--
-- Name: products products_sku_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key54 UNIQUE (sku);


--
-- Name: products products_sku_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key55 UNIQUE (sku);


--
-- Name: products products_sku_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key56 UNIQUE (sku);


--
-- Name: products products_sku_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key57 UNIQUE (sku);


--
-- Name: products products_sku_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key6 UNIQUE (sku);


--
-- Name: products products_sku_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key7 UNIQUE (sku);


--
-- Name: products products_sku_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key8 UNIQUE (sku);


--
-- Name: products products_sku_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key9 UNIQUE (sku);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: products products_slug_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key1 UNIQUE (slug);


--
-- Name: products products_slug_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key10 UNIQUE (slug);


--
-- Name: products products_slug_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key11 UNIQUE (slug);


--
-- Name: products products_slug_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key12 UNIQUE (slug);


--
-- Name: products products_slug_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key13 UNIQUE (slug);


--
-- Name: products products_slug_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key14 UNIQUE (slug);


--
-- Name: products products_slug_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key15 UNIQUE (slug);


--
-- Name: products products_slug_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key16 UNIQUE (slug);


--
-- Name: products products_slug_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key17 UNIQUE (slug);


--
-- Name: products products_slug_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key18 UNIQUE (slug);


--
-- Name: products products_slug_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key19 UNIQUE (slug);


--
-- Name: products products_slug_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key2 UNIQUE (slug);


--
-- Name: products products_slug_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key20 UNIQUE (slug);


--
-- Name: products products_slug_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key21 UNIQUE (slug);


--
-- Name: products products_slug_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key22 UNIQUE (slug);


--
-- Name: products products_slug_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key23 UNIQUE (slug);


--
-- Name: products products_slug_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key24 UNIQUE (slug);


--
-- Name: products products_slug_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key25 UNIQUE (slug);


--
-- Name: products products_slug_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key26 UNIQUE (slug);


--
-- Name: products products_slug_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key27 UNIQUE (slug);


--
-- Name: products products_slug_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key28 UNIQUE (slug);


--
-- Name: products products_slug_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key29 UNIQUE (slug);


--
-- Name: products products_slug_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key3 UNIQUE (slug);


--
-- Name: products products_slug_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key30 UNIQUE (slug);


--
-- Name: products products_slug_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key31 UNIQUE (slug);


--
-- Name: products products_slug_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key32 UNIQUE (slug);


--
-- Name: products products_slug_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key33 UNIQUE (slug);


--
-- Name: products products_slug_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key34 UNIQUE (slug);


--
-- Name: products products_slug_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key35 UNIQUE (slug);


--
-- Name: products products_slug_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key36 UNIQUE (slug);


--
-- Name: products products_slug_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key37 UNIQUE (slug);


--
-- Name: products products_slug_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key38 UNIQUE (slug);


--
-- Name: products products_slug_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key39 UNIQUE (slug);


--
-- Name: products products_slug_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key4 UNIQUE (slug);


--
-- Name: products products_slug_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key40 UNIQUE (slug);


--
-- Name: products products_slug_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key41 UNIQUE (slug);


--
-- Name: products products_slug_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key42 UNIQUE (slug);


--
-- Name: products products_slug_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key43 UNIQUE (slug);


--
-- Name: products products_slug_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key44 UNIQUE (slug);


--
-- Name: products products_slug_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key45 UNIQUE (slug);


--
-- Name: products products_slug_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key46 UNIQUE (slug);


--
-- Name: products products_slug_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key47 UNIQUE (slug);


--
-- Name: products products_slug_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key48 UNIQUE (slug);


--
-- Name: products products_slug_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key49 UNIQUE (slug);


--
-- Name: products products_slug_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key5 UNIQUE (slug);


--
-- Name: products products_slug_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key50 UNIQUE (slug);


--
-- Name: products products_slug_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key51 UNIQUE (slug);


--
-- Name: products products_slug_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key52 UNIQUE (slug);


--
-- Name: products products_slug_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key53 UNIQUE (slug);


--
-- Name: products products_slug_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key54 UNIQUE (slug);


--
-- Name: products products_slug_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key55 UNIQUE (slug);


--
-- Name: products products_slug_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key56 UNIQUE (slug);


--
-- Name: products products_slug_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key57 UNIQUE (slug);


--
-- Name: products products_slug_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key6 UNIQUE (slug);


--
-- Name: products products_slug_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key7 UNIQUE (slug);


--
-- Name: products products_slug_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key8 UNIQUE (slug);


--
-- Name: products products_slug_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key9 UNIQUE (slug);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key1 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key10 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key11 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key12 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key13 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key14 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key15 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key16 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key17 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key18 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key19 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key2 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key20 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key21 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key22 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key23 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key24 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key25 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key26 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key27 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key28 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key29 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key3 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key30 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key31 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key32 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key33 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key34 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key35 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key36 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key37 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key38 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key39 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key4 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key40 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key41 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key42 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key43 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key44 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key45 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key46 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key47 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key48 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key49 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key5 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key50 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key51 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key52 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key53 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key54 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key55 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key56 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key57 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key58 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key59 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key6 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key60 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key7 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key8 UNIQUE (token);


--
-- Name: refresh_tokens refresh_tokens_token_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key9 UNIQUE (token);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key UNIQUE (slug);


--
-- Name: subCategories subCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."subCategories"
    ADD CONSTRAINT "subCategories_pkey" PRIMARY KEY (id);


--
-- Name: subCategories subCategories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."subCategories"
    ADD CONSTRAINT "subCategories_slug_key" UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendor vendor_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key UNIQUE (email);


--
-- Name: vendor vendor_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key1 UNIQUE (email);


--
-- Name: vendor vendor_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key10 UNIQUE (email);


--
-- Name: vendor vendor_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key11 UNIQUE (email);


--
-- Name: vendor vendor_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key12 UNIQUE (email);


--
-- Name: vendor vendor_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key13 UNIQUE (email);


--
-- Name: vendor vendor_email_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key14 UNIQUE (email);


--
-- Name: vendor vendor_email_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key15 UNIQUE (email);


--
-- Name: vendor vendor_email_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key16 UNIQUE (email);


--
-- Name: vendor vendor_email_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key17 UNIQUE (email);


--
-- Name: vendor vendor_email_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key18 UNIQUE (email);


--
-- Name: vendor vendor_email_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key19 UNIQUE (email);


--
-- Name: vendor vendor_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key2 UNIQUE (email);


--
-- Name: vendor vendor_email_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key20 UNIQUE (email);


--
-- Name: vendor vendor_email_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key21 UNIQUE (email);


--
-- Name: vendor vendor_email_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key22 UNIQUE (email);


--
-- Name: vendor vendor_email_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key23 UNIQUE (email);


--
-- Name: vendor vendor_email_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key24 UNIQUE (email);


--
-- Name: vendor vendor_email_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key25 UNIQUE (email);


--
-- Name: vendor vendor_email_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key26 UNIQUE (email);


--
-- Name: vendor vendor_email_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key27 UNIQUE (email);


--
-- Name: vendor vendor_email_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key28 UNIQUE (email);


--
-- Name: vendor vendor_email_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key29 UNIQUE (email);


--
-- Name: vendor vendor_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key3 UNIQUE (email);


--
-- Name: vendor vendor_email_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key30 UNIQUE (email);


--
-- Name: vendor vendor_email_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key31 UNIQUE (email);


--
-- Name: vendor vendor_email_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key32 UNIQUE (email);


--
-- Name: vendor vendor_email_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key33 UNIQUE (email);


--
-- Name: vendor vendor_email_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key34 UNIQUE (email);


--
-- Name: vendor vendor_email_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key35 UNIQUE (email);


--
-- Name: vendor vendor_email_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key36 UNIQUE (email);


--
-- Name: vendor vendor_email_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key37 UNIQUE (email);


--
-- Name: vendor vendor_email_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key38 UNIQUE (email);


--
-- Name: vendor vendor_email_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key39 UNIQUE (email);


--
-- Name: vendor vendor_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key4 UNIQUE (email);


--
-- Name: vendor vendor_email_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key40 UNIQUE (email);


--
-- Name: vendor vendor_email_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key41 UNIQUE (email);


--
-- Name: vendor vendor_email_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key42 UNIQUE (email);


--
-- Name: vendor vendor_email_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key43 UNIQUE (email);


--
-- Name: vendor vendor_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key5 UNIQUE (email);


--
-- Name: vendor vendor_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key6 UNIQUE (email);


--
-- Name: vendor vendor_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key7 UNIQUE (email);


--
-- Name: vendor vendor_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key8 UNIQUE (email);


--
-- Name: vendor vendor_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_email_key9 UNIQUE (email);


--
-- Name: vendor vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_pkey PRIMARY KEY (id);


--
-- Name: websites websites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_pkey PRIMARY KEY (id);


--
-- Name: websites websites_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_url_key UNIQUE (url);


--
-- Name: addresses_account_id_is_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX addresses_account_id_is_default ON public.addresses USING btree ("accountId", "isDefault");


--
-- Name: addresses_account_id_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX addresses_account_id_type ON public.addresses USING btree ("accountId", type);


--
-- Name: attributes_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX attributes_name ON public.attributes USING btree (name);


--
-- Name: order_history_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_history_order_id ON public.order_history USING btree ("orderId");


--
-- Name: order_history_performed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_history_performed_by ON public.order_history USING btree ("performedBy");


--
-- Name: order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id ON public.order_items USING btree ("orderId");


--
-- Name: order_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id ON public.order_items USING btree ("productId");


--
-- Name: orders_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_account_id ON public.orders USING btree ("accountId");


--
-- Name: orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at ON public.orders USING btree ("createdAt");


--
-- Name: orders_payment_status_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_payment_status_created_at ON public.orders USING btree ("paymentStatus", "createdAt");


--
-- Name: orders_status_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_created_at ON public.orders USING btree (status, "createdAt");


--
-- Name: payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_order_id ON public.payments USING btree ("orderId");


--
-- Name: payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status ON public.payments USING btree (status);


--
-- Name: payments_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_transaction_id ON public.payments USING btree ("transactionId");


--
-- Name: product_attributes_attribute_id_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_attributes_attribute_id_value ON public.product_attributes USING btree ("attributeId", value);


--
-- Name: product_attributes_product_id_attribute_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_attributes_product_id_attribute_id ON public.product_attributes USING btree ("productId", "attributeId");


--
-- Name: product_attributes_product_id_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_attributes_product_id_value ON public.product_attributes USING btree ("productId", value);


--
-- Name: product_codes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_codes_code ON public.product_codes USING btree (code);


--
-- Name: product_pricing_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_pricing_currency ON public.product_pricing USING btree (currency);


--
-- Name: product_pricing_product_id_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_pricing_product_id_currency ON public.product_pricing USING btree ("productId", currency);


--
-- Name: product_quotes_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_quotes_email ON public.product_quotes USING btree (email);


--
-- Name: product_quotes_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_quotes_product_id ON public.product_quotes USING btree ("productId");


--
-- Name: product_quotes_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_quotes_status ON public.product_quotes USING btree (status);


--
-- Name: product_reviews_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_reviews_product_id ON public.product_reviews USING btree ("productId");


--
-- Name: product_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_reviews_rating ON public.product_reviews USING btree (rating);


--
-- Name: product_tags_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_tags_slug ON public.product_tags USING btree (slug);


--
-- Name: products_cat_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_cat_id ON public.products USING btree ("catId");


--
-- Name: products_catalog_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_catalog_id ON public.products USING btree ("catalogId");


--
-- Name: products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku ON public.products USING btree (sku);


--
-- Name: products_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug ON public.products USING btree (slug);


--
-- Name: products_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status ON public.products USING btree (status);


--
-- Name: products_sub_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sub_category_id ON public.products USING btree ("subCategoryId");


--
-- Name: products_website_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_website_id ON public.products USING btree ("websiteId");


--
-- Name: purchases_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchases_product_id ON public.purchases USING btree ("productId");


--
-- Name: purchases_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchases_status ON public.purchases USING btree (status);


--
-- Name: purchases_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchases_user_id ON public.purchases USING btree ("userId");


--
-- Name: purchases_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchases_vendor_id ON public.purchases USING btree ("vendorId");


--
-- Name: vendor_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendor_country ON public.vendor USING btree (country);


--
-- Name: vendor_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vendor_email ON public.vendor USING btree (email);


--
-- Name: vendor_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendor_phone ON public.vendor USING btree (phone);


--
-- Name: vendor_zip_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendor_zip_code ON public.vendor USING btree ("zipCode");


--
-- Name: websites_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX websites_user_id ON public.websites USING btree ("userId");


--
-- Name: addresses addresses_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attributes attributes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT "attributes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: catalogs catalogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT "catalogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: categories categories_catalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES public.catalogs(id) ON UPDATE CASCADE;


--
-- Name: categories categories_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: order_history order_history_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT "order_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attributes product_attributes_attributeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "product_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES public.attributes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attributes product_attributes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_codes product_codes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_codes
    ADD CONSTRAINT "product_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: product_pricing product_pricing_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_pricing
    ADD CONSTRAINT "product_pricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE;


--
-- Name: product_quotes product_quotes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_quotes
    ADD CONSTRAINT "product_quotes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_reviews product_reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_catId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_catId_fkey" FOREIGN KEY ("catId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_catalogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES public.catalogs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_productCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES public.product_codes(id);


--
-- Name: products products_subCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES public."subCategories"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: purchases purchases_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE;


--
-- Name: purchases purchases_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: purchases purchases_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT "purchases_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendor(id) ON UPDATE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subCategories subCategories_catId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."subCategories"
    ADD CONSTRAINT "subCategories_catId_fkey" FOREIGN KEY ("catId") REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: subCategories subCategories_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."subCategories"
    ADD CONSTRAINT "subCategories_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: users users_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendor vendor_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT "vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: websites websites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT "websites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

