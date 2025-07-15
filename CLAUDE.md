# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built for a coding assessment to create an enhanced geography-focused chatbot. The project uses TypeScript with strict mode, React 19, and Tailwind CSS v4.

## Essential Commands

- `pnpm run dev` - Start development server
- `pnpm run build` - Build production version
- `pnpm start` - Start production server
- `pnpm run lint` - Run ESLint checks

## Architecture

The project follows Next.js App Router structure:

- **`src/app/`** - Main application code

  - `page.tsx` - Chatbox UI component (fixed bottom-right)
  - `api/stream/route.ts` - Edge runtime streaming endpoint (currently echoes messages)
  - `layout.tsx` - Root layout with global styles
  - `globals.css` - Tailwind CSS styles

- **Edge Runtime** - The `/api/stream` endpoint uses Edge runtime for low latency streaming responses

## Key Requirements

The chatbot needs to:

1. **Onboarding Flow**: Ask users for their favorite country, continent, and destination
2. **Geography Focus**: Answer world geography questions using GPT-4.1 model
3. **Streaming Responses**: Use OpenAI streaming API via the Edge runtime endpoint
4. **User Preferences**: Allow users to change their onboarding preferences

## Environment Variables

Copy `.env.example` to `.env` and add OpenAI API keys:

- `OPENAI_API_KEY` - Required for GPT-4.1 access

## Technical Constraints

- Node.js version: 22.15.0 (use `nvm use`)
- TypeScript strict mode is enabled
- Use OpenAI packages for API integration (install with pnpm)
- No database required (mock data is acceptable)
- Maintain Edge runtime for the streaming endpoint

## Styling

Where you can use lastest tailwind! If this is not possible then using other styling approaches if you require complex styling that cannot be done with tailwind!

## Language

Use British English throughout all files, specs and documentation, and ensure that all code is clearly and professionally commented.

## Audio alert when tasks are complete

run `afplay /System/Library/Sounds/Glass.aiff` (or any other system sound) at the end of the tasks, or when my input is needed from me to proceed with a task.

<!-- ## Dev logs

At the end of every session create a new file in the `docs/dev-logs` directory with the date and a detailed summary of the session, including when sucessfully git commited and pushed. -->

## MODEL Usage

You must use the gpt-4.1 model

## Other

- Do not pnpm run dev yourself. Just prompt me at the end of your response.
- TypeScript with strict mode enabled, therefore all code must adhere to prevent build errors.
