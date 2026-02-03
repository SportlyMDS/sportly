CREATE TYPE "public"."club_offer_type" AS ENUM('ESSENTIEL', 'VISIBILITE');--> statement-breakpoint
CREATE TYPE "public"."club_registration_status" AS ENUM('DRAFT', 'PENDING', 'VERIFIED', 'COMPLETED');--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "registration_status" "club_registration_status" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "offer_type" "club_offer_type" DEFAULT 'ESSENTIEL';--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "sports" text[];--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "admin_first_name" varchar(80);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "admin_last_name" varchar(80);--> statement-breakpoint
ALTER TABLE "clubs" ADD COLUMN "verification_id" text;