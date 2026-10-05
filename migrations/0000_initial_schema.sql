CREATE TABLE "harvested_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"source_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"harvested_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_code_derivations" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_code" text NOT NULL,
	"derived_address" varchar(66) NOT NULL,
	"derivation_index" integer NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	CONSTRAINT "payment_code_derivations_payment_code_unique" UNIQUE("payment_code")
);
--> statement-breakpoint
CREATE TABLE "payment_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_string" text NOT NULL,
	"wallet_type" varchar(50) DEFAULT 'BlueWallet',
	"derived_sample_address" varchar(66),
	"created_timestamp" timestamp DEFAULT now(),
	"notes" text,
	CONSTRAINT "payment_codes_code_string_unique" UNIQUE("code_string")
);
--> statement-breakpoint
CREATE TABLE "protocol_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_b64" text NOT NULL,
	"decoded_fragment" text,
	"valid_jwt" boolean DEFAULT false,
	"source_type" varchar(50),
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "yield_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_debt" numeric(20, 2) NOT NULL,
	"daily_penalty" numeric(20, 2) NOT NULL,
	"days_passed" integer NOT NULL,
	"total_penalties" numeric(20, 2) NOT NULL,
	"unpaid_tribute" numeric(20, 2) NOT NULL,
	"grand_total" numeric(20, 2) NOT NULL,
	"proofs_status" text NOT NULL,
	"report_header" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;