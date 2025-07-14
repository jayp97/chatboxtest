# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built for a coding assessment to create an enhanced geography-focused chatbot. The project uses TypeScript with strict mode, React 19, and Tailwind CSS v4.

## Essential Commands

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm start` - Start production server  
- `npm run lint` - Run ESLint checks

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
- Use OpenAI npm packages for API integration
- No database required (mock data is acceptable)
- Maintain Edge runtime for the streaming endpoint