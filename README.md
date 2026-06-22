# ✈️ AI Travel Planner

A full-stack web application that generates personalized travel itineraries using AI. Plan your perfect trip with day-by-day activities, budget estimation, and hotel recommendations - all powered by an open-source LLM agent.

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Setup Instructions](#-setup-instructions)
- [Architecture](#-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [AI Agent Design](#-ai-agent-design)
- [Creative Features](#-creative-features)
- [Key Design Decisions & Trade-offs](#-key-design-decisions--trade-offs)
- [Known Limitations](#-known-limitations)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)

---

## 🌟 Project Overview

The **AI Travel Planner** is a multi-user web application that leverages Large Language Models (LLMs) to generate complete, personalized travel itineraries. Users provide their destination, trip duration, budget preferences, and interests - the AI agent then creates a structured day-by-day travel plan with estimated costs and hotel recommendations.

### Core Capabilities
- **AI-Powered Itinerary Generation**: Creates structured, day-by-day travel plans using open-source LLMs.
- **Budget Estimation**: Provides detailed cost breakdowns (flights, accommodation, food, activities).
- **Hotel Recommendations**: Suggests accommodation based on budget and destination tiering.
- **Editable Itineraries**: Users can modify, add, or remove activities.
- **Personalized Dashboard**: Each user has their own trip management dashboard.
- **Multi-User Support**: Complete data isolation between users via robust authentication.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Node.js** | Runtime Environment | Event-driven architecture perfect for asynchronous, I/O-heavy AI operations. |
| **Express** | Web Framework | Minimalist framework with excellent middleware support for building clean APIs. |
| **MongoDB / Atlas** | Database | Flexible document schema natively matching complex JSON itinerary structures. |
| **Mongoose** | ODM | Offers strict schema validation and query abstraction over MongoDB data layers. |
| **TypeScript** | Language | Full compile-time type-safety, advanced IDE tooling, and self-documenting code. |
| **JWT** | Authentication | Stateless authentication handling, making distributed system routes highly scalable. |
| **Bcrypt** | Password Hashing | Industry-standard cryptographic salt/hash protection for user passwords. |

### Frontend
| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Next.js 14+** | Framework | Server-Side Rendering (SSR), optimized build routing, and premier frontend DX. |
| **React 18** | UI Library | Component-driven reactivity allowing complex, fast-rendering UI state changes. |
| **Tailwind CSS** | Styling | Utility-first framework enabling rapid custom UI prototyping without heavy CSS files. |
| **Axios** | HTTP Client | Global network management supporting modular interceptors and error catching. |

### AI Integration
| Service / Model | Purpose | Justification |
|---------|---------|---------------|
| **Hugging Face API Router** | Public AI Gateway | Access point for open-source foundation models via standardized formats. |
| **Qwen/Qwen2.5-7B-Instruct** | Core LLM Agent | Exceptional performance in reasoning, highly accurate Markdown formatting, and strict structural layout handling. |

---

## 🔧 Setup Instructions

### Local Development

#### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/ai-travel-planner.git](https://github.com/yourusername/ai-travel-planner.git)
cd ai-travel-planner
```

#### 2. Backend Setup
Create a `.env` file in the `backend/` folder:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
HF_API_KEY=your_huggingface_access_token
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
```
Install dependencies and run:
```bash
cd backend
npm install
npm run dev
```

#### 3. Frontend Setup
Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
Install dependencies and run:
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🏗️ Architecture

The system utilizes a modern, decoupled client-server architecture containing a **monorepo** layout structure separated into independent execution folders:

```
                      +-------------------+
                      |   Next.js UI      | (Client Vercel Layer)
                      +---------+---------+
                                |
                   Secure HTTP  |  JWT Header Tokens
                                v
                      +---------+---------+
                      |   Express API     | (Server Render Layer)
                      +----+---------+----+
                           |         |
      Mongoose Connection  |         |  JSON Payloads (POST /v1/chat)
                           v         v
                +------------+     +------------------------+
                | MongoDB    |     | Hugging Face AI Router |
                | Atlas Cloud|     | (Qwen2.5-7B-Instruct)  |
                +------------+     +------------------------+
```

1. **Client Layer (Frontend)**: Next.js reads environment-specific API configurations, captures configuration inputs, and handles client routing paths dynamically.
2. **Controller Layer (Backend)**: Express manages state routing, processes request validation middleware, and protects application channels.
3. **Persistance Layer (Database)**: Custom Mongoose schemas format, write, and safely isolate operational multi-user configurations.

---

## 🔒 Authentication & Authorization

Securing personal data isolation is fundamentally anchored by a custom validation middleware framework:

* **Authentication Process**: Users authenticate via a `/api/auth/login` gateway. Correct verification flags encode a stateless JSON Web Token (JWT) bearing user-identifying markers (`userId`).
* **Route Interception Rules**: Private resources are nested behind an active structural gateway middleware:
  ```typescript
  app.use('/api/trips', requireAuth);
  ```
* **Data Isolation Enforcement**: The `requireAuth` interceptor decodes valid payloads and assigns incoming markers to `req.user`. Internal Mongoose database queries fetch data exclusively using this validation marker:
  ```typescript
  const trips = await Trip.find({ userId: req.user.id });
  ```

---

## 🤖 AI Agent Design

```
[ User Inputs ] -> [ Context Prompt Assembly ] -> [ HF Unified Gateway ] -> [ Structured Itinerary Outputs ]
```

The application features a specialized generative assistant optimized for structuring geographic data. 

### API Routing Implementation
Due to the deprecation of legacy serverless model-specific URLs, the application routes inference payloads through Hugging Face’s modern, high-speed **Unified Chat Completion Gateway**:
* **Target Endpoint**: `https://router.huggingface.co/v1/chat/completions`
* **Data Transmission Format**: Conforms fully to OpenAI standard structures, packing request metadata directly into a `messages` collection.

### Operational Request Structure
```typescript
const response = await fetch('[https://router.huggingface.co/v1/chat/completions](https://router.huggingface.co/v1/chat/completions)', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.HF_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: process.env.HF_MODEL,
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  })
});
```

---

## 🎨 Creative Features

### 🛠️ Inline Itinerary Customizer
Unlike standard generators that render static text outputs, this platform features an **Interactive Timeline Editor**. 

* **The Magic**: The raw AI-generated payload parses dynamically into manageable system-level states.
* **Granular Control**: Users can dynamically remove individual text elements, swap itinerary days, inject newly desired location activities, or recalibrate budget calculations instantly without re-running long backend generative sequences.

---

## ⚖️ Key Design Decisions & Trade-offs

### 1. Unified Gateway API Routing over Direct Inferences
* **Decision**: Migrated execution logic from legacy specific links (`api-inference.huggingface.co/models/...`) to the modern, consolidated router.
* **Trade-off**: This change introduces a dependency on standard Chat Completion schemas, meaning we write slightly more verbose message-array payload structures. However, it ensures long-term operational uptime and gives us the flexibility to swap model backends in the `.env` instantly without touching core execution loops.

### 2. Node Network Execution Adjustments
* **Decision**: Forced IPv4 lookup priority globally using standard code hooks:
  ```typescript
  dns.setDefaultResultOrder('ipv4first');
  ```
* **Trade-off**: While this completely bypasses local environment DNS drops (`getaddrinfo ENOTFOUND`) caused by modern Node/undici IPv6 handling discrepancies, it restricts local development environments from resolving via dual-stack routing channels. This is an intentional trade-off to ensure robust stability across varying ISP local routers.

---

## ⚠️ Known Limitations

* **Context Length Thresholds**: Model generation token capacities are hard-capped (`max_tokens: 1000`). Requests trying to plan long trips (e.g., beyond 10-14 sequential days) might get truncated.
* **Cold Starts**: Using the free public serverless endpoints might introduce brief execution latencies if Hugging Face needs to reload the model onto provider hardware.

---

## 🚀 Deployment

### Backend Deployment (Render)
1. Set up a **Web Service** on Render connected to your GitHub repository.
2. Specify the **Root Directory** as: `backend`
3. Set the **Build Command** to: `npm install && npm run build`
4. Set the **Start Command** to: `npm run start`
5. Configure your variables under **Environment Variables**:
   * Set `MONGO_URI` to your cloud Atlas instance.
   * Add `0.0.0.0/0` inside your Atlas Network Settings to whitelist Render's servers.

### Frontend Deployment (Vercel)
1. Set up a new project on Vercel linked to the repository.
2. Set the **Root Directory** to: `frontend`
3. Add the **Environment Variable**: `NEXT_PUBLIC_API_URL` pointing to your newly created live Render URL backend.
4. Click **Deploy**.