# EchOo — Voice Command Grocery Shopping Assistant

## 1. Approach

EchOo was developed as a modular, voice-enabled grocery shopping application that allows users to interact using both natural-language text and voice commands. The frontend is built with React and Vite, while Supabase provides authentication and persistent product, cart, profile, and order data.

Browser Speech Recognition captures voice commands and forwards recognized text through a Node.js voice service. The AI backend is built with FastAPI. Cohere is used for reasoning and selecting the appropriate product, cart, order, or RAG operation. Supabase remains the source of truth for product variants, prices, stock, carts, and orders, while Groq generates natural responses from verified backend results.

The application supports contextual conversations, product discovery, price/brand/size filtering, cart management, recommendations, alternatives, voice feedback, and text-to-speech responses.

The frontend and voice server are containerized and deployed on Render, while the AI backend is deployed as a separate Render service.

### Project Links

| Resource | Link |
|---|---|
| 🌐 Live Website | [https://echoo-grocery-shopping-assistant.onrender.com/](https://echoo-grocery-shopping-assistant.onrender.com/) |
| 💻 Website GitHub Repository | [https://github.com/Sp-bit-code/echoo-grocery-shopping-assistant](https://github.com/Sp-bit-code/echoo-grocery-shopping-assistant) |
| 🤖 Voice Command Chatbot GitHub | [https://github.com/Sp-bit-code/Grocery-Chatbot-API](https://github.com/Sp-bit-code/Grocery-Chatbot-API) |
| 🚀 Live AI Backend | [https://grocery-chatbot-api.onrender.com/](https://grocery-chatbot-api.onrender.com/) |

---

# 2. Project Explanation

EchOo is a grocery shopping assistant designed to make product discovery and shopping more conversational. A user can type or speak commands such as **“Show me milk under ₹100”**, **“Find Maggi”**, **“Show the 32g variant”**, or **“Add it to my cart.”**

The assistant understands follow-up queries by carrying conversation context, allowing users to select a product or variant and refer to it naturally in the next message.

Search results are generated from real product data stored in Supabase. Products can include multiple SKU variants with different sizes, prices, and stock quantities. The assistant can also return alternatives and semantic product recommendations through RAG.

Voice interaction is handled directly in the browser for faster microphone access. Responses can also be spoken using the text-to-speech service.

Authentication ensures that cart, profile, and order information belongs only to the authenticated user.

---

# 3. Implemented Features

| Category | Feature | Implementation |
|---|---|---|
| 🎙️ Voice Input | Voice command recognition | Browser microphone with Web Speech Recognition |
| 🎙️ Voice Input | Real-time transcript | Recognized speech is displayed while the user speaks |
| 🎙️ Voice Input | Automatic voice submission | Captured voice query is automatically submitted |
| 🎙️ Voice Input | Configurable input language | Voice input language can be configured through environment settings |
| 🧠 NLP | Natural-language commands | Users are not limited to predefined command formats |
| 🧠 NLP | Context-aware conversation | Follow-up commands remember selected products and variants |
| 🧠 NLP | AI reasoning | Cohere determines the appropriate tool/action for a request |
| 🔎 Search | Product search | Search products using conversational text or voice |
| 🔎 Search | Brand filtering | Search can include product brand |
| 🔎 Search | Price filtering | Queries such as “milk under ₹100” are supported |
| 🔎 Search | Size filtering | Users can select SKU variants such as 32g, 500ml, etc. |
| 🔎 Search | Stock information | Available stock is returned with product variants |
| 🔎 Search | Semantic search | RAG supports meaning-based product discovery |
| 🛒 Cart | Add products | Products can be added using text or voice commands |
| 🛒 Cart | Remove products | Products can be removed from the cart |
| 🛒 Cart | Quantity management | Cart quantities can be changed through natural commands |
| 🛒 Cart | Variant-aware cart | Specific SKU/size selections are maintained |
| 🛒 Cart | Persistent cart | Cart data is stored per authenticated user |
| 🗂️ Products | Product categories | Products are organized by categories |
| 💡 Suggestions | Product recommendations | RAG-based relevant product suggestions |
| 💡 Suggestions | Product alternatives | Alternative products can be suggested when appropriate |
| 📦 Orders | Order management | Orders and order details are stored in Supabase |
| 📦 Orders | Order history | Authenticated users can view their previous orders |
| 🔐 Authentication | Email/password login | Supabase authentication |
| 🔐 Authentication | Google login | Google OAuth through Supabase |
| 🔐 Authentication | User isolation | Protected operations use the verified Supabase user |
| 👤 Profile | User profile | User profile information is stored in Supabase |
| 🔊 Voice Output | Text-to-speech | Assistant responses can be spoken using Edge TTS |
| 🔊 Voice Output | Stop Response | User can immediately stop assistant speech |
| ⏳ UX | Loading states | Processing states are displayed during AI requests |
| 👁️ UX | Visual feedback | Products, variants, cart actions and assistant responses are displayed |
| 📱 UX | Responsive UI | Interface supports desktop and mobile layouts |
| 🛠️ Admin | Product management | Admin interface supports grocery product management |
| 🗄️ Database | Supabase PostgreSQL | Stores products, profiles, carts and orders |
| 🔒 Security | JWT authentication | Protected AI operations use Supabase access tokens |
| 🔒 Security | RLS-compatible architecture | User-specific operations are isolated |
| 🚀 Deployment | Docker deployment | Application is containerized |
| 🚀 Deployment | Render hosting | Frontend, voice server and AI backend are deployed |

---

# 4. Architecture

```mermaid
flowchart TD

    U[User]

    U -->|Text Query| UI[React + Vite Frontend]
    U -->|Voice Command| STT[Browser Speech Recognition]

    STT --> UI

    UI -->|Authentication| AUTH[Supabase Auth]

    UI -->|Typed AI Request| API[FastAPI AI Backend]
    UI -->|Voice Request| NODE[Node.js Voice Server]

    NODE -->|Authenticated Query| API

    API --> COHERE[Cohere Reasoning]

    COHERE --> PRODUCT[Product Tools]
    COHERE --> CART[Cart Tools]
    COHERE --> ORDER[Order Tools]
    COHERE --> RAG[RAG Search]

    PRODUCT --> DB[(Supabase PostgreSQL)]
    CART --> DB
    ORDER --> DB
    RAG --> DB

    API --> GROQ[Groq Response Generation]

    GROQ --> API

    API -->|Structured JSON| UI

    UI -->|Text for speech| NODE
    NODE --> TTS[Python + Edge TTS]
    TTS -->|MP3 Audio| UI

    UI --> USEROUT[Products / Cart / Orders / Recommendations / Voice Response]
