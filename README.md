# EchOo — Voice Command Grocery Shopping Assistant

## 1. Approach

EchOo is a voice-enabled grocery shopping application designed to provide a natural and conversational shopping experience. The frontend is built using React and Vite, while Supabase manages authentication and persistent product, profile, cart, and order data.

Users can interact through text or browser-based voice commands. Voice input is captured using the Web Speech Recognition API and processed through a Node.js voice service. The FastAPI AI backend uses Cohere for reasoning and selecting product, cart, order, or RAG operations. Supabase remains the source of truth for product variants, prices, stock, carts, and orders. Groq generates natural-language responses from verified backend results.

The application supports contextual follow-up commands, product filtering, cart management, alternatives, recommendations, visual feedback, loading states, and text-to-speech responses. Docker is used for containerization, and the complete application is deployed on Render.

### Project Links

| Resource | Link |
|---|---|
| Live Website | [https://echoo-grocery-shopping-assistant.onrender.com/](https://echoo-grocery-shopping-assistant.onrender.com/) |
| Website GitHub Repository | [https://github.com/Sp-bit-code/echoo-grocery-shopping-assistant](https://github.com/Sp-bit-code/echoo-grocery-shopping-assistant) |
| Voice Command Chatbot GitHub | [https://github.com/Sp-bit-code/Grocery-Chatbot-API](https://github.com/Sp-bit-code/Grocery-Chatbot-API) |
| Live AI Backend | [https://grocery-chatbot-api.onrender.com/](https://grocery-chatbot-api.onrender.com/) |

---

## 2. Project Explanation

EchOo allows users to shop using natural text or voice commands instead of relying only on traditional navigation and filters.

A user can say **“Show me milk under ₹100”**, **“Find Maggi”**, **“Show me the 32g variant”**, or **“Add it to my cart.”** The assistant maintains conversation context, allowing short follow-up commands to refer to previously selected products and variants.

Products are retrieved from Supabase and can contain multiple SKU variants with individual sizes, prices, and stock quantities. RAG enables semantic product discovery, while the assistant can provide relevant alternatives and recommendations.

Authenticated users have isolated profile, cart, and order data. Voice responses are generated using Edge TTS and returned to the browser as audio. The interface provides real-time recognized text, loading feedback, structured product results, cart confirmations, order information, and responsive interaction for both desktop and mobile users.

---

## 3. Implemented Features

| Category | Feature | Implementation |
|---|---|---|
| Voice Input | Voice command recognition | Browser microphone using Web Speech Recognition |
| Voice Input | Natural voice queries | Supports conversational grocery-shopping commands |
| Voice Input | Real-time transcription | Recognized text is displayed while speaking |
| Voice Input | Automatic submission | Voice query is processed automatically after recognition |
| Voice Input | Configurable input language | Speech input language can be configured through environment settings |
| NLP | Natural-language processing | Understands different ways of expressing shopping requests |
| NLP | Context-aware conversation | Maintains selected product and variant context across follow-up requests |
| NLP | AI reasoning | Cohere determines the appropriate backend operation |
| Search | Product search | Search products using text or voice |
| Search | Brand filtering | Supports brand-specific queries |
| Search | Price filtering | Supports queries such as “milk under ₹100” |
| Search | Size filtering | Supports SKU and product-size selection |
| Search | Variant search | Returns multiple available variants of a product |
| Search | Stock information | Displays available stock for product variants |
| Search | Semantic product search | RAG supports meaning-based product discovery |
| Cart | Add products | Products can be added through natural commands |
| Cart | Remove products | Products can be removed from the cart |
| Cart | Quantity management | Product quantities can be changed |
| Cart | Variant-aware cart | Selected SKU or size is retained during cart actions |
| Cart | Persistent cart | Cart information is stored for each authenticated user |
| Products | Product categorization | Products are organized into grocery categories |
| Suggestions | Product recommendations | Relevant products can be suggested using RAG |
| Suggestions | Product alternatives | Alternative products can be returned when appropriate |
| Orders | Order creation | Orders can be created and stored |
| Orders | Order details | Individual order information is maintained |
| Orders | Order history | Authenticated users can view previous orders |
| Authentication | Email/password authentication | Implemented using Supabase Auth |
| Authentication | Google OAuth | Google authentication through Supabase |
| Authentication | User isolation | Protected operations use the verified authenticated user |
| Profile | User profile | User information is maintained in Supabase |
| Voice Output | Text-to-speech | Assistant responses are converted to speech using Edge TTS |
| Voice Output | Stop Response | Users can immediately stop assistant speech |
| UX | Loading states | Processing feedback is displayed during AI requests |
| UX | Visual feedback | Recognized text, products, variants, actions, cart and orders are displayed |
| UX | Responsive interface | Designed for desktop and mobile usage |
| Admin | Product management | Admin interface supports grocery product management |
| Database | Supabase PostgreSQL | Stores products, profiles, carts and orders |
| Security | JWT authentication | Protected AI operations use Supabase access tokens |
| Security | RLS-compatible architecture | User-specific database operations remain isolated |
| Reliability | Error handling | Frontend and backend include error states and validation |
| Deployment | Docker | Application is containerized for production |
| Deployment | Render | Website, Node voice service and AI backend are deployed |

---

## 4. System Architecture

```mermaid
flowchart TD

    USER[User]

    USER -->|Text Query| UI[React + Vite Frontend]
    USER -->|Voice Command| STT[Browser Speech Recognition]

    STT --> UI

    UI -->|Authentication| AUTH[Supabase Auth]

    UI -->|Typed AI Query| API[FastAPI AI Backend]
    UI -->|Voice Request| NODE[Node.js Voice Server]

    NODE -->|Transcript + Access Token| API

    API --> COHERE[Cohere Reasoning]

    COHERE --> PRODUCT[Product Tools]
    COHERE --> CART[Cart Tools]
    COHERE --> ORDER[Order Tools]
    COHERE --> RAG[RAG Product Retrieval]

    PRODUCT --> DB[(Supabase PostgreSQL)]
    CART --> DB
    ORDER --> DB
    RAG --> DB

    API --> GROQ[Groq Response Generation]

    GROQ --> API

    API -->|Structured JSON Response| UI

    UI -->|Response Text| NODE
    NODE --> TTS[Python + Edge TTS]
    TTS -->|MP3 Audio| UI

    UI --> OUTPUT[Products / Cart / Orders / Recommendations / Voice Response]
```

---

## 5. Interface

### Home Page

<p align="center">
  <img src="https://raw.githubusercontent.com/Sp-bit-code/echoo-grocery-shopping-assistant/main/Interface%20images/Home.png" alt="EchOo Home Page" width="900"/>
</p>

---

### AI Voice Assistant

<p align="center">
  <img src="https://raw.githubusercontent.com/Sp-bit-code/echoo-grocery-shopping-assistant/main/Interface%20images/AI.png" alt="EchOo AI Voice Assistant" width="900"/>
</p>

---

### Shopping Menu

<p align="center">
  <img src="https://raw.githubusercontent.com/Sp-bit-code/echoo-grocery-shopping-assistant/main/Interface%20images/Menu.png" alt="EchOo Shopping Menu" width="900"/>
</p>

---

### Orders

<p align="center">
  <img src="https://raw.githubusercontent.com/Sp-bit-code/echoo-grocery-shopping-assistant/main/Interface%20images/Orders.png" alt="EchOo Orders Page" width="900"/>
</p>

---

### Admin Interface

<p align="center">
  <img src="https://raw.githubusercontent.com/Sp-bit-code/echoo-grocery-shopping-assistant/main/Interface%20images/Adminside.png" alt="EchOo Admin Interface" width="900"/>
</p>

---

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite |
| Routing | React Router |
| UI / Icons | Lucide React, Heroicons |
| Animation | Framer Motion |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Backend API | Python + FastAPI |
| Voice Server | Node.js + Express |
| Browser Voice Recognition | Web Speech Recognition API |
| Text-to-Speech | Python + Edge TTS |
| AI Reasoning | Cohere |
| Response Generation | Groq — `openai/gpt-oss-120b` |
| Product Retrieval | RAG |
| Search / Matching | RapidFuzz |
| HTTP Communication | Fetch, HTTPX, Requests |
| Containerization | Docker |
| Deployment | Render |
| Version Control | Git + GitHub |

---

## 7. Environment Configuration

Environment files and private API credentials are not committed to the repository.

### Frontend Environment

For local development:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

VITE_ASSISTANT_API_URL=https://grocery-chatbot-api.onrender.com

VITE_VOICE_API_URL=http://localhost:5000

VITE_ASSISTANT_VOICE=en-IN-NeerjaNeural
VITE_INPUT_LANGUAGE=en-IN
```

In production, the React frontend and Node voice server share the same Render origin, therefore the localhost voice URL is not used.

### AI Backend Environment

```env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY

COHERE_API_KEY=YOUR_COHERE_API_KEY
COHERE_MODEL=YOUR_COHERE_MODEL

GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_API_KEY1=YOUR_SECOND_GROQ_API_KEY
GROQ_API_KEY2=YOUR_THIRD_GROQ_API_KEY

GROQ_MODEL=openai/gpt-oss-120b
GROQ_TEMPERATURE=0.0

RAG_MATCH_COUNT=5
MAX_CHAT_HISTORY=10
```

> Secret keys are stored securely as deployment environment variables and are never committed to GitHub.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/Sp-bit-code/echoo-grocery-shopping-assistant/main/Interface%20images/AI.png" alt="EchOo Voice Command Grocery Shopping Assistant" width="900"/>
</p>
