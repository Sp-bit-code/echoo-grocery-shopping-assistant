import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../../context/AuthContext.jsx";

import {
  playAssistantSpeech,
  sendAssistantMessage,
  stopAssistantSpeechPlayback,
  stopBrowserSpeechRecognition,
  transcribeBrowserSpeech,
} from "../../../api/assistantApi.js";

import "./AIAssistant.css";

/* =========================================================
   QUICK PROMPTS
========================================================= */

const QUICK_PROMPT_GROUPS = [
  {
    title: "Find Groceries",
    prompts: [
      "Show me milk under ₹100",
      "Find 1 kg atta",
      "Show breakfast cereals",
      "Find cooking oil under ₹500",
    ],
  },
  {
    title: "Smart Suggestions",
    prompts: [
      "Suggest healthy breakfast products",
      "Suggest high-protein snacks",
      "What can I buy for pasta night?",
      "Show me healthy drinks for breakfast",
    ],
  },
  {
    title: "My Shopping",
    prompts: [
      "What is in my cart?",
      "Show my recent orders",
      "What is my latest order status?",
      "Show my last order details",
    ],
  },
];

const PRIVATE_QUERY_WORDS = [
  "my cart",
  "in my cart",
  "my order",
  "latest order",
  "last order",
  "recent orders",
  "order status",
  "order history",
];

/* =========================================================
   MODERN LOADING STATUS
========================================================= */

const ASSISTANT_LOADING_STEPS = [
  "Understanding your request…",
  "Searching our product catalog…",
  "Checking live prices and availability…",
  "Comparing the best matching products…",
  "Reviewing variants and recommendations…",
  "Preparing your response…",
];

const ASSISTANT_LOADING_SECONDS = 60;

const formatCountdown = (seconds) => {
  const safeSeconds =
    Math.max(
      0,
      Number(seconds) || 0
    );

  const minutes =
    Math.floor(
      safeSeconds / 60
    );

  const remainingSeconds =
    safeSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

/* =========================================================
   MESSAGE HELPERS
========================================================= */

const createMessage = ({
  role,
  content,
  meta = null,
}) => ({
  id: `${role}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`,

  role,
  content,
  meta,

  createdAt:
    new Date().toISOString(),
});

const isPrivateQuery = (text) => {
  const value =
    String(text || "")
      .toLowerCase();

  return PRIVATE_QUERY_WORDS.some(
    (word) =>
      value.includes(word)
  );
};

/* =========================================================
   STRUCTURED RESPONSE HELPERS
========================================================= */

const formatMoney = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? `₹${number.toLocaleString("en-IN")}`
    : String(value);
};

const renderFormattedText = (text) =>
  String(text || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") &&
      part.endsWith("**") ? (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={index}>
          {part}
        </React.Fragment>
      )
    );

const getProductImage = (product) =>
  product?.image_url ||
  product?.imageUrl ||
  product?.image ||
  product?.thumbnail_url ||
  product?.images?.[0]?.url ||
  product?.images?.[0] ||
  null;

const getProductVariants = (product) =>
  Array.isArray(product?.variants)
    ? product.variants
    : Array.isArray(product?.skus)
      ? product.skus
      : [];

/* =========================================================
   VOICE SPEECH HELPERS

   TTS should sound natural and concise.

   Rules:
   - Remove markdown / special symbols.
   - Keep letters, numbers, spaces and full stops only.
   - Do not read SKU tables, stock counts or currency symbols.
   - When products are returned, read product names as:
       "Products. 1. Product name. 2. Product name."
========================================================= */

const cleanTextForSpeech = (text) => {
  const cleaned =
    String(text || "")
      /*
        Remove links before removing punctuation so the
        assistant does not try to read URL fragments.
      */
      .replace(
        /https?:\/\/\S+/gi,
        " "
      )
      .replace(
        /www\.\S+/gi,
        " "
      )
      /*
        Remove apostrophes without adding a gap so names such
        as "Lay's" become "Lays" instead of "Lay s".
      */
      .replace(
        /['’]/g,
        ""
      )
      /*
        Markdown and common UI / currency symbols.
      */
      .replace(
        /[*_~`#₹$€£¥•▪◦►▶→←|\\\/@%^&+=<>{}\[\]():;,!?"“”‘]/g,
        " "
      )
      /*
        Hyphens should become spaces so names such as
        "2-Minute" are spoken as "2 Minute".
      */
      .replace(
        /[-–—]/g,
        " "
      )
      /*
        Keep only Unicode letters, numbers, whitespace
        and full stops.
      */
      .replace(
        /[^\p{L}\p{N}\s.]/gu,
        " "
      )
      /*
        Normalize repeated full stops and whitespace.
      */
      .replace(
        /\.{2,}/g,
        "."
      )
      .replace(
        /\s*\.\s*/g,
        ". "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return cleaned;
};

const ensureSpeechFullStop = (
  text
) => {
  const cleaned =
    cleanTextForSpeech(
      text
    );

  if (!cleaned) {
    return "";
  }

  return cleaned.endsWith(".")
    ? cleaned
    : `${cleaned}.`;
};

const getVoiceItemNames = (
  items
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seen =
    new Set();

  return items
    .map((item) =>
      item?.name ||
      item?.product_name ||
      item?.title ||
      ""
    )
    .map((name) =>
      cleanTextForSpeech(
        name
      )
    )
    .filter((name) => {
      if (!name) {
        return false;
      }

      const key =
        name.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
};

const buildVoiceItemSection = (
  title,
  items
) => {
  const names =
    getVoiceItemNames(
      items
    );

  if (!names.length) {
    return "";
  }

  return `${title}. ${names
    .map(
      (name, index) =>
        `${index + 1}. ${ensureSpeechFullStop(
          name
        )}`
    )
    .join(" ")}`;
};

const buildVoiceResponse = (
  response
) => {
  /*
    Speak the COMPLETE assistant response first so no opening
    explanation or ending line is lost.

    Then speak structured product names separately.
  */

  const responseText =
    ensureSpeechFullStop(
      response?.message ||
      response?.text ||
      ""
    );

  const productsText =
    buildVoiceItemSection(
      "Products",
      response?.products
    );

  const alternativesText =
    buildVoiceItemSection(
      "Alternatives",
      response?.alternatives
    );

  const recommendationsText =
    buildVoiceItemSection(
      "Recommendations",
      response?.recommendations
    );

  return [
    responseText,
    productsText,
    alternativesText,
    recommendationsText,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

/* =========================================================
   PRODUCT CARD
========================================================= */

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const imageUrl =
    getProductImage(product);

  const name =
    product?.name ||
    product?.product_name ||
    product?.title ||
    "Product";

  const variants =
    getProductVariants(product);

  return (
    <article className="ai-product-card">
      {imageUrl && (
        <img
          className="ai-product-image"
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      )}

      <div className="ai-product-content">
        <div className="ai-product-top">
          <div>
            <h4>{name}</h4>

            {(product?.brand ||
              product?.category) && (
              <p>
                {[
                  product?.brand,
                  product?.category,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}
          </div>

          {product?.price !== undefined && (
            <strong className="ai-product-price">
              {formatMoney(
                product.price
              )}
            </strong>
          )}
        </div>

        {variants.length > 0 && (
          <div className="ai-product-variants">
            {variants.map(
              (variant, index) => {
                const label =
                  variant?.label ||
                  variant?.size ||
                  variant?.weight ||
                  variant?.name ||
                  variant?.sku ||
                  `Variant ${index + 1}`;

                const price =
                  variant?.price ??
                  variant?.selling_price ??
                  variant?.mrp;

                const stock =
                  variant?.stock_quantity ??
                  variant?.stock;

                const outOfStock =
                  variant?.in_stock === false ||
                  Number(stock) === 0;

                return (
                  <div
                    className="ai-product-variant"
                    key={
                      variant?.id ||
                      variant?.sku ||
                      `${label}-${index}`
                    }
                  >
                    <span>{label}</span>

                    <div>
                      {price !== undefined &&
                        price !== null && (
                          <strong>
                            {formatMoney(
                              price
                            )}
                          </strong>
                        )}

                      {(stock !== undefined ||
                        variant?.in_stock !==
                          undefined) && (
                        <small
                          className={
                            outOfStock
                              ? "ai-stock-out"
                              : "ai-stock-in"
                          }
                        >
                          {outOfStock
                            ? "Out of stock"
                            : stock !== undefined
                              ? `${stock} in stock`
                              : "In stock"}
                        </small>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </article>
  );
};

/* =========================================================
   CART CARD
========================================================= */

const CartDetails = ({ cart }) => {
  if (!cart) {
    return null;
  }

  const items =
    cart?.items ||
    cart?.cart_items ||
    [];

  const total =
    cart?.total ??
    cart?.total_amount ??
    cart?.grand_total;

  return (
    <section className="ai-data-section">
      <p className="ai-data-title">
        Cart
      </p>

      <div className="ai-cart-card">
        {items.length ? (
          items.map((item, index) => (
            <div
              className="ai-data-row"
              key={
                item?.id ||
                `${item?.name}-${index}`
              }
            >
              <span>
                {item?.product?.name ||
                  item?.product_name ||
                  item?.name ||
                  "Item"}
              </span>

              <span>
                Qty{" "}
                {item?.quantity ??
                  item?.qty ??
                  1}
              </span>

              {(item?.total ??
                item?.price ??
                item?.unit_price) !==
                undefined && (
                <strong>
                  {formatMoney(
                    item?.total ??
                      item?.price ??
                      item?.unit_price
                  )}
                </strong>
              )}
            </div>
          ))
        ) : (
          <p className="ai-data-empty">
            Your cart is empty.
          </p>
        )}

        {total !== undefined &&
          total !== null && (
            <div className="ai-data-total">
              <span>Total</span>

              <strong>
                {formatMoney(total)}
              </strong>
            </div>
          )}
      </div>
    </section>
  );
};

/* =========================================================
   ORDER CARD
========================================================= */

const OrderDetails = ({
  order,
  title = "Order",
}) => {
  if (!order) {
    return null;
  }

  const items =
    order?.items ||
    order?.order_items ||
    order?.order_details ||
    [];

  const orderId =
    order?.order_number ||
    order?.order_id ||
    order?.id;

  const total =
    order?.total ??
    order?.total_amount ??
    order?.grand_total;

  return (
    <section className="ai-data-section">
      <p className="ai-data-title">
        {title}
      </p>

      <div className="ai-order-card">
        <div className="ai-order-header">
          <div>
            <small>Order</small>

            <strong>
              {orderId || "—"}
            </strong>
          </div>

          {(order?.status ||
            order?.order_status) && (
            <span className="ai-order-status">
              {order?.status ||
                order?.order_status}
            </span>
          )}
        </div>

        {order?.payment_status && (
          <p className="ai-order-payment">
            Payment:{" "}
            <strong>
              {order.payment_status}
            </strong>
          </p>
        )}

        {items.length > 0 && (
          <div className="ai-order-items">
            {items.map((item, index) => (
              <div
                className="ai-data-row"
                key={
                  item?.id ||
                  `${item?.product_name}-${index}`
                }
              >
                <span>
                  {item?.product?.name ||
                    item?.product_name ||
                    item?.name ||
                    "Item"}
                </span>

                <span>
                  Qty{" "}
                  {item?.quantity ??
                    item?.qty ??
                    1}
                </span>

                {(item?.total ??
                  item?.price ??
                  item?.unit_price) !==
                  undefined && (
                  <strong>
                    {formatMoney(
                      item?.total ??
                        item?.price ??
                        item?.unit_price
                    )}
                  </strong>
                )}
              </div>
            ))}
          </div>
        )}

        {total !== undefined &&
          total !== null && (
            <div className="ai-data-total">
              <span>Total</span>

              <strong>
                {formatMoney(total)}
              </strong>
            </div>
          )}
      </div>
    </section>
  );
};

/* =========================================================
   STRUCTURED RESPONSE
========================================================= */

const StructuredMessageDetails = ({
  meta,
}) => {
  if (!meta) {
    return null;
  }

  const groups = [
    {
      title: "Products",
      items: meta?.products,
    },
    {
      title: "Alternatives",
      items: meta?.alternatives,
    },
    {
      title: "Recommendations",
      items: meta?.recommendations,
    },
  ];

  return (
    <div className="ai-structured-response">
      {groups.map((group) =>
        Array.isArray(group.items) &&
        group.items.length > 0 ? (
          <section
            className="ai-data-section"
            key={group.title}
          >
            <p className="ai-data-title">
              {group.title}
            </p>

            <div className="ai-product-grid">
              {group.items.map(
                (product, index) => (
                  <ProductCard
                    key={
                      product?.id ||
                      product?.product_id ||
                      `${group.title}-${index}`
                    }
                    product={product}
                  />
                )
              )}
            </div>
          </section>
        ) : null
      )}

      <CartDetails
        cart={meta?.cart}
      />

      <OrderDetails
        order={meta?.latestOrder}
        title="Latest order"
      />

      {!meta?.latestOrder &&
        Array.isArray(meta?.orders) &&
        meta.orders.length > 0 && (
          <div className="ai-orders-list">
            {meta.orders.map(
              (order, index) => (
                <OrderDetails
                  key={
                    order?.id ||
                    order?.order_id ||
                    index
                  }
                  order={order}
                  title={`Order ${index + 1}`}
                />
              )
            )}
          </div>
        )}
    </div>
  );
};

/* =========================================================
   ASSISTANT LOADING COMPONENT
========================================================= */

const AssistantLoading = ({
  speakSteps = false,
  onStepChange = null,
}) => {
  const [
    stepIndex,
    setStepIndex,
  ] = useState(0);

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(
    ASSISTANT_LOADING_SECONDS
  );

  const lastSpokenStepRef =
    useRef("");

  useEffect(() => {
    const stepInterval =
      window.setInterval(() => {
        setStepIndex(
          (currentIndex) =>
            (
              currentIndex + 1
            ) %
            ASSISTANT_LOADING_STEPS.length
        );
      }, 2200);

    return () => {
      window.clearInterval(
        stepInterval
      );
    };
  }, []);

  useEffect(() => {
    const timerInterval =
      window.setInterval(() => {
        setSecondsRemaining(
          (currentSeconds) =>
            Math.max(
              0,
              currentSeconds - 1
            )
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timerInterval
      );
    };
  }, []);

  const progress =
    (
      secondsRemaining /
      ASSISTANT_LOADING_SECONDS
    ) * 100;

  const statusText =
    secondsRemaining > 0
      ? ASSISTANT_LOADING_STEPS[
          stepIndex
        ]
      : "Still working on your request…";

  /*
    For microphone-originated queries, report the exact visible
    loader sentence to the parent. The parent serializes TTS so
    loader phrases never overlap each other or the final answer.
  */

  useEffect(() => {
    if (!speakSteps) {
      lastSpokenStepRef.current =
        "";

      return;
    }

    if (
      !statusText ||
      lastSpokenStepRef.current ===
        statusText
    ) {
      return;
    }

    lastSpokenStepRef.current =
      statusText;

    if (
      typeof onStepChange ===
      "function"
    ) {
      onStepChange(
        statusText
      );
    }
  }, [
    statusText,
    speakSteps,
    onStepChange,
  ]);

  return (
    <div
      className="ai-loading-status"
      aria-live="polite"
      aria-label="EchOo AI is processing your request"
    >
      <div className="ai-loading-status-top">
        <div className="ai-loading-status-copy">
          <span className="ai-loading-pulse" />

          <span
            key={`${stepIndex}-${statusText}`}
            className="ai-loading-status-text"
          >
            {statusText}
          </span>
        </div>

        <div className="ai-loading-countdown">
          <span className="ai-loading-countdown-label">
            Response
          </span>

          <strong>
            {formatCountdown(
              secondsRemaining
            )}
          </strong>
        </div>
      </div>

      <div
        className="ai-loading-progress"
        aria-hidden="true"
      >
        <span
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};

/* =========================================================
   MESSAGE COMPONENT
========================================================= */

const ChatMessage = ({
  message,
}) => {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`ai-message-row ${
        isUser
          ? "ai-message-row-user"
          : "ai-message-row-assistant"
      }`}
    >
      <div
        className={`ai-message-bubble ${
          isUser
            ? "ai-message-user"
            : "ai-message-assistant"
        }`}
      >
        {!isUser && (
          <div className="ai-message-label">
            <SparklesIcon />

            EchOo AI
          </div>
        )}

        <p className="ai-message-text">
          {renderFormattedText(
            message.content
          )}
        </p>

        {!isUser && (
          <StructuredMessageDetails
            meta={message.meta}
          />
        )}
      </div>
    </div>
  );
};

/* =========================================================
   AI ASSISTANT PAGE
========================================================= */

const AIAssistant = () => {
  const {
    user,
    profile,
    isAuthenticated,
  } = useAuth();

  const [messages, setMessages] =
    useState(() => [
      createMessage({
        role: "assistant",

        content:
          "Hi! I’m EchOo AI. I’ll help you discover groceries, build shopping lists, find products and manage your shopping using natural language.",
      }),
    ]);

  const [
    input,
    setInput,
  ] = useState("");

  const [
    sending,
    setSending,
  ] = useState(false);

  /* =========================================================
     VOICE STATE

     Voice input uses the browser microphone.
     The recognized transcript is sent through the same
     existing sendAssistantMessage() flow as typed messages.

     Voice responses are generated by the Node voice server
     and played in the browser.
  ========================================================= */

  const [
    isVoiceStarting,
    setIsVoiceStarting,
  ] = useState(false);

  const [
    isListening,
    setIsListening,
  ] = useState(false);

  const [
    isSpeaking,
    setIsSpeaking,
  ] = useState(false);

  /*
    True while the TTS MP3 is still being generated.

    This lets the Stop response button stay visible even
    before browser audio has actually started playing.
  */

  const [
    isSpeechPreparing,
    setIsSpeechPreparing,
  ] = useState(false);

  const [
    voiceStatus,
    setVoiceStatus,
  ] = useState("");

  /*
    Red status is used for the short microphone prompt:
      "Now speak"

    The previous artificial 3-second wait has been removed.
  */

  const [
    isVoicePromptRed,
    setIsVoicePromptRed,
  ] = useState(false);

  /*
    True only while a microphone-originated query is waiting
    for the AI response. Typed queries keep the visual loader
    but do not speak the loader steps.
  */

  const [
    voiceQueryLoading,
    setVoiceQueryLoading,
  ] = useState(false);

  const speechAudioRef =
    useRef(null);

  const speechRequestRef =
    useRef(0);

  /*
    Used to resolve a speech Promise when audio is cancelled.
  */

  const speechEndResolverRef =
    useRef(null);

  /*
    Loader TTS queue:
    - one phrase at a time
    - only the latest waiting phrase is kept
    - final response gets priority
  */

  const loaderSpeechBusyRef =
    useRef(false);

  const pendingLoaderStepRef =
    useRef("");

  const lastLoaderSpeechRef =
    useRef("");

  const voiceQueryLoadingRef =
    useRef(false);

  /*
    When the user presses Stop response, keep the backend
    request running but suppress all remaining loader/final TTS
    for that request. The visual answer will still be shown.
  */

  const responseSpeechStoppedRef =
    useRef(false);

  const voicePromptTimerRef =
    useRef(null);

  /*
    Every microphone click gets a voice-cycle ID.

    This prevents a cancelled / old recognition result from
    automatically submitting after the user has already
    stopped listening or started another voice request.
  */

  const voiceCycleRef =
    useRef(0);

  /*
    The frontend keeps one conversation ID while
    the current chat is active.

    This allows follow-up queries such as:

    "show me milk"
    "which one is cheapest?"
    "add the 1 litre one"
  */

  const [
    conversationId,
    setConversationId,
  ] = useState(
    () =>
      globalThis.crypto
        ?.randomUUID?.() ||
      `conversation-${Date.now()}`
  );

  /*
    The backend returns client_state after every
    request.

    We keep that state here and send it back as
    client_context on the next message.

    It contains conversational context only.
    Price, stock, cart and order facts still come
    from the backend / Supabase.
  */

  const [
    clientContext,
    setClientContext,
  ] = useState({});

  const scrollRef =
    useRef(null);

  const inputRef =
    useRef(null);

  /* =========================================================
     VOICE HELPERS
  ========================================================= */

  const clearVoicePromptTimer = () => {
    if (
      voicePromptTimerRef.current
    ) {
      window.clearTimeout(
        voicePromptTimerRef.current
      );

      voicePromptTimerRef.current =
        null;
    }
  };

  const stopSpeaking = () => {
    /*
      Invalidate any TTS request still being generated.
    */

    speechRequestRef.current +=
      1;

    /*
      Also cancel the active/pending audio managed by
      assistantApi.js. This is important when Stop response is
      pressed while the MP3 is still being generated.
    */

    try {
      stopAssistantSpeechPlayback();
    } catch {
      // Safe TTS cleanup only.
    }

    const audio =
      speechAudioRef.current;

    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Browser audio cleanup only.
      }

      speechAudioRef.current =
        null;
    }

    /*
      If a loader/final speech Promise is waiting for onEnd,
      release it immediately when speech is cancelled.
    */

    const resolveSpeech =
      speechEndResolverRef.current;

    speechEndResolverRef.current =
      null;

    if (resolveSpeech) {
      resolveSpeech();
    }

    setIsSpeaking(false);
    setIsSpeechPreparing(false);
  };

  const speakTextAndWait =
    async (
      text,
      {
        showStatus = false,
      } = {}
    ) => {
      const cleanText =
        ensureSpeechFullStop(
          text
        );

      if (!cleanText) {
        return;
      }

      const requestId =
        speechRequestRef.current +
        1;

      speechRequestRef.current =
        requestId;

      setIsSpeechPreparing(true);

      await new Promise(
        async (resolve) => {
          let settled =
            false;

          const finish = () => {
            if (settled) {
              return;
            }

            settled =
              true;

            if (
              speechEndResolverRef.current ===
              finish
            ) {
              speechEndResolverRef.current =
                null;
            }

            resolve();
          };

          speechEndResolverRef.current =
            finish;

          try {
            const audio =
              await playAssistantSpeech({
                text:
                  cleanText,

                voice:
                  import.meta.env
                    .VITE_ASSISTANT_VOICE ||
                  "en-IN-NeerjaNeural",

                onStart: () => {
                  if (
                    requestId !==
                    speechRequestRef.current
                  ) {
                    return;
                  }

                  setIsSpeechPreparing(false);
                  setIsSpeaking(true);

                  if (showStatus) {
                    setVoiceStatus(
                      "EchOo is speaking…"
                    );
                  }
                },

                onEnd: () => {
                  if (
                    requestId ===
                    speechRequestRef.current
                  ) {
                    speechAudioRef.current =
                      null;

                    setIsSpeechPreparing(false);
                    setIsSpeaking(false);

                    if (showStatus) {
                      setVoiceStatus("");
                    }
                  }

                  finish();
                },

                onError: () => {
                  if (
                    requestId ===
                    speechRequestRef.current
                  ) {
                    speechAudioRef.current =
                      null;

                    setIsSpeechPreparing(false);
                    setIsSpeaking(false);

                    if (showStatus) {
                      setVoiceStatus(
                        "Voice playback was unavailable."
                      );
                    }
                  }

                  finish();
                },
              });

            /*
              This request may have been cancelled while the
              MP3 was still being generated.
            */

            if (
              requestId !==
              speechRequestRef.current
            ) {
              try {
                audio?.pause?.();

                if (audio) {
                  audio.currentTime =
                    0;
                }
              } catch {
                // Stale audio cleanup only.
              }

              finish();

              return;
            }

            speechAudioRef.current =
              audio;

            if (!audio) {
              finish();
            }
          } catch (error) {
            if (
              requestId ===
              speechRequestRef.current &&
              showStatus
            ) {
              setIsSpeechPreparing(false);
              setIsSpeaking(false);

              setVoiceStatus(
                error?.message ||
                "Voice playback was unavailable."
              );
            }

            finish();
          }
        }
      );
    };

  const speakAssistantResponse =
    async (
      text
    ) => {
      /*
        Final response always replaces loader speech.
      */

      stopSpeaking();

      await speakTextAndWait(
        text,
        {
          showStatus: true,
        }
      );
    };

  const runLoaderSpeechQueue =
    async () => {
      if (
        loaderSpeechBusyRef.current
      ) {
        return;
      }

      loaderSpeechBusyRef.current =
        true;

      try {
        while (
          voiceQueryLoadingRef.current
        ) {
          const nextStep =
            pendingLoaderStepRef.current;

          pendingLoaderStepRef.current =
            "";

          if (!nextStep) {
            break;
          }

          await speakTextAndWait(
            nextStep,
            {
              showStatus: false,
            }
          );
        }
      } finally {
        loaderSpeechBusyRef.current =
          false;

        /*
          A new loader step may have arrived between the loop
          ending and busy=false.
        */

        if (
          voiceQueryLoadingRef.current &&
          pendingLoaderStepRef.current
        ) {
          void runLoaderSpeechQueue();
        }
      }
    };

  const handleLoadingStepSpeech =
    (stepText) => {
      if (
        !voiceQueryLoadingRef.current ||
        responseSpeechStoppedRef.current
      ) {
        return;
      }

      const cleaned =
        ensureSpeechFullStop(
          stepText
        );

      if (
        !cleaned ||
        cleaned ===
          lastLoaderSpeechRef.current
      ) {
        return;
      }

      lastLoaderSpeechRef.current =
        cleaned;

      /*
        Keep only the latest not-yet-spoken loader sentence.
        This prevents a backlog if TTS is slower than the
        visual loader.
      */

      pendingLoaderStepRef.current =
        cleaned;

      void runLoaderSpeechQueue();
    };

  /* =========================================================
     USER
  ========================================================= */

  const displayName = useMemo(() => {
    const account =
      profile || user;

    return (
      account?.full_name ||
      account?.name ||
      account?.email ||
      "User"
    );
  }, [
    profile,
    user,
  ]);

  /* =========================================================
     SCROLL / FOCUS
  ========================================================= */

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    sending,
  ]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /*
    Stop browser recognition/audio when this page unmounts.
  */

  useEffect(() => {
    return () => {
      /*
        Invalidate pending recognition/TTS callbacks.
      */

      voiceCycleRef.current +=
        1;

      voiceQueryLoadingRef.current =
        false;

      pendingLoaderStepRef.current =
        "";

      clearVoicePromptTimer();

      speechRequestRef.current +=
        1;

      try {
        stopBrowserSpeechRecognition();
      } catch {
        // Browser speech cleanup only.
      }

      const audio =
        speechAudioRef.current;

      if (audio) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // Browser audio cleanup only.
        }
      }
    };
  }, []);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage = async (
    customMessage = "",
    options = {}
  ) => {
    const shouldSpeakResponse =
      Boolean(
        options?.speakResponse
      );

    const finalMessage =
      String(
        customMessage ||
          input ||
          ""
      ).trim();

    if (
      !finalMessage ||
      sending
    ) {
      return;
    }

    /*
      A new request should stop any previous spoken response.
    */

    stopSpeaking();

    responseSpeechStoppedRef.current =
      false;

    pendingLoaderStepRef.current =
      "";

    lastLoaderSpeechRef.current =
      "";

    const userMessage =
      createMessage({
        role: "user",
        content:
          finalMessage,
      });

    /*
      Personal cart/order questions require
      authentication even after the backend
      is connected.
    */

    if (
      isPrivateQuery(
        finalMessage
      ) &&
      !isAuthenticated
    ) {
      const authMessage =
        "Please sign in first so I can securely access your cart and order information.";

      setMessages(
        (previous) => [
          ...previous,
          userMessage,

          createMessage({
            role: "assistant",

            content:
              authMessage,
          }),
        ]
      );

      setInput("");

      if (
        shouldSpeakResponse
      ) {
        void speakAssistantResponse(
          authMessage
        );
      }

      return;
    }

    /*
      Show the user's message immediately.
    */

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setInput("");

    /*
      Loader speech is enabled only for voice-originated
      queries. Typed queries keep the same visual loader.
    */

    voiceQueryLoadingRef.current =
      shouldSpeakResponse;

    setVoiceQueryLoading(
      shouldSpeakResponse
    );

    setSending(true);

    try {
      /*
        REAL BACKEND CALL

        AIAssistant.jsx
              ↓
        assistantApi.js
              ↓
        Supabase session.access_token
              ↓
        Authorization: Bearer <token>
              ↓
        Render FastAPI /chat
      */

      const response =
        await sendAssistantMessage({
          message:
            finalMessage,

          conversationId,

          context:
            clientContext,

          locale:
            "en-IN",
        });

      /*
        Preserve backend conversation ID.
      */

      if (
        response?.conversationId
      ) {
        setConversationId(
          response.conversationId
        );
      }

      /*
        Preserve backend conversational state.

        This is returned to the backend on the
        user's next message.
      */

      if (
        response?.clientContext
      ) {
        setClientContext(
          response.clientContext
        );
      }

      /*
        Add real assistant response to the
        existing chat UI.

        Structured backend information is kept
        in message.meta so we can render product,
        cart and order cards.
      */

      const assistantText =
        response?.message ||
        response?.text ||
        "I couldn't generate a response right now.";

      setMessages(
        (previous) => [
          ...previous,

          createMessage({
            role: "assistant",

            content:
              assistantText,

            meta: {
              responseType:
                response?.responseType ||
                null,

              products:
                response?.products ||
                [],

              alternatives:
                response?.alternatives ||
                [],

              recommendations:
                response?.recommendations ||
                [],

              cart:
                response?.cart ||
                null,

              orders:
                response?.orders ||
                [],

              latestOrder:
                response?.latestOrder ||
                null,
            },
          }),
        ]
      );

      /*
        The backend has finished.

        Stop the visual loader and loader narration before the
        final response starts speaking.
      */

      voiceQueryLoadingRef.current =
        false;

      setVoiceQueryLoading(false);

      pendingLoaderStepRef.current =
        "";

      setSending(false);

      stopSpeaking();

      /*
        Only voice-originated requests automatically speak
        the assistant response.

        Product results are intentionally summarized as:

          Products.
          1. Product name.
          2. Product name.

        SKU prices, stock counts and special symbols stay
        visible on screen but are not spoken.
      */

      if (
        shouldSpeakResponse &&
        !responseSpeechStoppedRef.current
      ) {
        const voiceResponse =
          buildVoiceResponse(
            response
          );

        if (
          voiceResponse
        ) {
          void speakAssistantResponse(
            voiceResponse
          );
        }
      }

      return response;
    } catch (error) {
      /*
        Stop processing voice and loader before presenting
        the error.
      */

      voiceQueryLoadingRef.current =
        false;

      setVoiceQueryLoading(false);

      pendingLoaderStepRef.current =
        "";

      stopSpeaking();
      setSending(false);

      const errorMessage =
        error?.message ||
        "I couldn't reach the grocery assistant right now. Please try again.";

      /*
        Keep API errors inside the chat instead
        of breaking the page.
      */

      setMessages(
        (previous) => [
          ...previous,

          createMessage({
            role: "assistant",

            content:
              errorMessage,
          }),
        ]
      );

      if (
        shouldSpeakResponse &&
        !responseSpeechStoppedRef.current
      ) {
        void speakAssistantResponse(
          errorMessage
        );
      }

      return null;
    } finally {
      /*
        Idempotent safety reset.

        The normal success/error paths already stop the
        loader as soon as the backend request completes.
      */

      setSending(false);
    }
  };

  /* =========================================================
     VOICE INPUT

     Updated flow:

       Click microphone
            ↓
       RED: Now speak
            ↓
       microphone starts immediately
            ↓
       "Now speak" disappears automatically
            ↓
       one spoken query
            ↓
       automatic submit

     There is NO artificial 3-second delay.
  ========================================================= */

  const handleVoiceInput =
    async () => {
      if (
        sending ||
        isVoiceStarting ||
        isListening
      ) {
        return;
      }

      stopSpeaking();

      responseSpeechStoppedRef.current =
        false;

      clearVoicePromptTimer();

      const voiceCycleId =
        voiceCycleRef.current +
        1;

      voiceCycleRef.current =
        voiceCycleId;

      /*
        Show the prompt immediately and begin browser
        recognition without waiting.
      */

      setIsVoiceStarting(true);
      setIsListening(false);
      setIsVoicePromptRed(true);

      setVoiceStatus(
        "Now speak"
      );

      try {
        const result =
          await transcribeBrowserSpeech({
            language:
              import.meta.env
                .VITE_INPUT_LANGUAGE ||
              "en-IN",

            onStart: () => {
              if (
                voiceCycleId !==
                voiceCycleRef.current
              ) {
                return;
              }

              setIsVoiceStarting(false);
              setIsListening(true);
              setIsVoicePromptRed(true);

              /*
                Keep "Now speak" visible briefly after the browser
                confirms the microphone is active, then remove it.
              */

              clearVoicePromptTimer();

              voicePromptTimerRef.current =
                window.setTimeout(
                  () => {
                    if (
                      voiceCycleId !==
                      voiceCycleRef.current
                    ) {
                      return;
                    }

                    setVoiceStatus("");
                    setIsVoicePromptRed(false);

                    voicePromptTimerRef.current =
                      null;
                  },
                  1200
                );
            },

            onInterim: (
              transcript
            ) => {
              if (
                voiceCycleId !==
                voiceCycleRef.current
              ) {
                return;
              }

              setInput(
                transcript
              );
            },

            onEnd: () => {
              if (
                voiceCycleId !==
                voiceCycleRef.current
              ) {
                return;
              }

              clearVoicePromptTimer();

              setIsVoiceStarting(false);
              setIsListening(false);
              setIsVoicePromptRed(false);
              setVoiceStatus("");
            },

            onError: (
              error
            ) => {
              if (
                voiceCycleId !==
                voiceCycleRef.current
              ) {
                return;
              }

              clearVoicePromptTimer();

              setIsVoiceStarting(false);
              setIsListening(false);
              setIsVoicePromptRed(false);

              setVoiceStatus(
                error?.message ||
                "Voice input failed."
              );
            },
          });

        if (
          voiceCycleId !==
          voiceCycleRef.current
        ) {
          return;
        }

        const transcript =
          String(
            result?.text ||
            result?.transcript ||
            ""
          ).trim();

        clearVoicePromptTimer();

        setIsVoiceStarting(false);
        setIsListening(false);
        setIsVoicePromptRed(false);
        setVoiceStatus("");

        if (!transcript) {
          setVoiceStatus(
            "No speech was detected."
          );

          return;
        }

        setInput(
          transcript
        );

        /*
          Automatic submit.
          No Enter key or send-button click is needed.
        */

        await sendMessage(
          transcript,
          {
            speakResponse:
              true,
          }
        );
      } catch (error) {
        if (
          voiceCycleId !==
          voiceCycleRef.current
        ) {
          return;
        }

        clearVoicePromptTimer();

        setIsVoiceStarting(false);
        setIsListening(false);
        setIsVoicePromptRed(false);

        setVoiceStatus(
          error?.message ||
          "I couldn't hear you. Please try again."
        );
      }
    };

  const handleVoiceButtonClick =
    () => {
      /*
        Clicking again while the microphone is starting or
        listening cancels the current cycle.
      */

      if (
        isVoiceStarting ||
        isListening
      ) {
        voiceCycleRef.current +=
          1;

        clearVoicePromptTimer();

        try {
          stopBrowserSpeechRecognition();
        } catch {
          // Browser speech cleanup only.
        }

        setIsVoiceStarting(false);
        setIsListening(false);
        setIsVoicePromptRed(false);
        setVoiceStatus("");

        return;
      }

      if (isSpeaking) {
        stopSpeaking();
      }

      void handleVoiceInput();
    };

  /* =========================================================
     STOP SPOKEN RESPONSE

     This stops loader/final TTS immediately but does NOT cancel
     the backend request. The text/product response can still
     finish and remain visible in the chat.
  ========================================================= */

  const handleStopResponse = () => {
    responseSpeechStoppedRef.current =
      true;

    voiceQueryLoadingRef.current =
      false;

    setVoiceQueryLoading(false);

    pendingLoaderStepRef.current =
      "";

    lastLoaderSpeechRef.current =
      "";

    stopSpeaking();

    setVoiceStatus(
      "Voice response stopped."
    );
  };

  /* =========================================================
     FORM
  ========================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    sendMessage();
  };

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  /* =========================================================
     CLEAR CHAT
  ========================================================= */

  const clearChat = () => {
    /*
      Invalidate any voice result that has not returned yet.
    */

    voiceCycleRef.current +=
      1;

    voiceQueryLoadingRef.current =
      false;

    responseSpeechStoppedRef.current =
      false;

    setVoiceQueryLoading(false);

    pendingLoaderStepRef.current =
      "";

    lastLoaderSpeechRef.current =
      "";

    clearVoicePromptTimer();

    try {
      stopBrowserSpeechRecognition();
    } catch {
      // Browser speech cleanup only.
    }

    stopSpeaking();

    setIsVoiceStarting(false);
    setIsListening(false);
    setIsVoicePromptRed(false);
    setVoiceStatus("");

    setMessages([
      createMessage({
        role: "assistant",

        content:
          "Chat cleared. Ask me to find groceries, suggest meals, build a shopping list or help with your orders.",
      }),
    ]);

    setInput("");

    /*
      Clearing the chat also starts a fresh
      backend conversation.
    */

    setConversationId(
      globalThis.crypto
        ?.randomUUID?.() ||
      `conversation-${Date.now()}`
    );

    setClientContext({});
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="ai-assistant-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="ai-assistant-hero">
        <div className="ai-assistant-hero-copy">
          <p className="ai-assistant-eyebrow">
            <SparklesIcon />

            EchOo Assistant
          </p>

          <h1>
            Shop smarter.
            <br />
            Just ask.
          </h1>

          <p className="ai-assistant-description">
            Find groceries,
            get smart suggestions
            and build your shopping
            list using natural
            language.
          </p>
        </div>

        <div className="ai-user-card">
          <span
            className={`ai-user-dot ${
              isAuthenticated
                ? "ai-user-dot-online"
                : ""
            }`}
          />

          <div>
            <p>
              {isAuthenticated
                ? "Signed in"
                : "Guest mode"}
            </p>

            <strong>
              {isAuthenticated
                ? displayName
                : "Product discovery available"}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          ASSISTANT SHELL
      ===================================================== */}

      <section className="ai-assistant-shell">

        {/* HEADER */}

        <div className="ai-assistant-header">
          <div>
            <div className="ai-assistant-title-row">
              <div className="ai-assistant-icon">
                <SparklesIcon />
              </div>

              <div>
                <h2>
                  Chat with EchOo AI
                </h2>

                <p>
                  Your grocery shopping
                  assistant.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ai-clear-button"
            onClick={clearChat}
          >
            <TrashIcon />

            Clear
          </button>
        </div>

        {/* ===================================================
            MAIN AREA
        =================================================== */}

        <div className="ai-assistant-main">

          {/* QUICK PROMPTS */}

          <aside className="ai-prompt-sidebar">
            <div className="ai-prompt-heading">
              <p className="ai-prompt-eyebrow">
                Suggestions
              </p>

              <h3>
                Try asking
              </h3>
            </div>

            <div className="ai-quick-prompts">
              {QUICK_PROMPT_GROUPS.map(
                (group) => (
                  <div
                    key={
                      group.title
                    }
                    className="ai-prompt-group"
                  >
                    <p className="ai-prompt-title">
                      {group.title}
                    </p>

                    <div className="ai-prompt-list">
                      {group.prompts.map(
                        (prompt) => (
                          <button
                            key={
                              prompt
                            }
                            type="button"
                            onClick={() =>
                              sendMessage(
                                prompt
                              )
                            }
                            disabled={
                              sending ||
                              isVoiceStarting ||
                              isListening
                            }
                          >
                            {prompt}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {!isAuthenticated && (
              <div className="ai-login-note">
                <p>
                  Sign in to ask about
                  your cart and orders.
                </p>

                <Link to="/sign_in">
                  Sign In →
                </Link>
              </div>
            )}
          </aside>

          {/* =================================================
              CHAT
          ================================================= */}

          <div className="ai-chat-area">
            <div className="ai-chat-window">

              {messages.map(
                (message) => (
                  <ChatMessage
                    key={
                      message.id
                    }
                    message={
                      message
                    }
                  />
                )
              )}

              {sending && (
                <div className="ai-message-row ai-message-row-assistant">
                  <div className="ai-message-bubble ai-message-assistant ai-message-loading">
                    <div className="ai-message-label">
                      <SparklesIcon />

                      EchOo AI
                    </div>

                    <AssistantLoading
                      speakSteps={
                        voiceQueryLoading
                      }
                      onStepChange={
                        handleLoadingStepSpeech
                      }
                    />
                  </div>
                </div>
              )}

              <div
                ref={scrollRef}
              />
            </div>

            {/* ===============================================
                INPUT
            =============================================== */}

            <form
              className="ai-input-area"
              onSubmit={
                handleSubmit
              }
            >
              {/* VOICE BUTTON */}

              <button
                type="button"
                className={`ai-voice-button ${
                  isVoiceStarting ||
                  isListening
                    ? "ai-voice-button-listening"
                    : ""
                } ${
                  isSpeaking
                    ? "ai-voice-button-speaking"
                    : ""
                }`}
                title={
                  isVoiceStarting
                    ? "Starting microphone"
                    : isListening
                      ? "Stop listening"
                      : isSpeaking
                        ? "Start a new voice command"
                        : "Speak to EchOo"
                }
                aria-label={
                  isVoiceStarting
                    ? "Preparing voice input"
                    : isListening
                      ? "Stop voice input"
                      : "Voice shopping"
                }
                aria-pressed={
                  isVoiceStarting ||
                  isListening
                }
                onClick={
                  handleVoiceButtonClick
                }
                disabled={
                  sending
                }
              >
                <MicrophoneIcon />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(
                  event
                ) =>
                  setInput(
                    event.target
                      .value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder={
                  isVoiceStarting
                    ? "Now speak…"
                    : isListening
                      ? "Listening…"
                      : "Ask for groceries, meal ideas, shopping lists..."
                }
                rows={1}
                disabled={
                  sending ||
                  isVoiceStarting ||
                  isListening
                }
                spellCheck="true"
                autoCorrect="on"
                autoCapitalize="sentences"
                autoComplete="on"
              />

              <button
                type="submit"
                className="ai-send-button"
                disabled={
                  sending ||
                  isVoiceStarting ||
                  isListening ||
                  !input.trim()
                }
                aria-label="Send message"
              >
                {sending ? (
                  <span className="ai-send-loading">
                    ...
                  </span>
                ) : (
                  <PaperAirplaneIcon />
                )}
              </button>
            </form>

            <div className="ai-assistant-footer-note">
              <SparklesIcon />

              <span
                style={
                  isVoicePromptRed
                    ? {
                        color: "#dc2626",
                        fontWeight: 700,
                      }
                    : undefined
                }
              >
                {voiceStatus ||
                  (isSpeaking
                    ? "EchOo is speaking…"
                    : "Voice commands, multilingual input and smart RAG search are ready.")}
              </span>

              {(isSpeechPreparing ||
                isSpeaking ||
                voiceQueryLoading) && (
                <button
                  type="button"
                  onClick={
                    handleStopResponse
                  }
                  aria-label="Stop spoken response"
                  title="Stop spoken response"
                  style={{
                    marginLeft: "auto",
                    border: "1px solid #dc2626",
                    background: "transparent",
                    color: "#dc2626",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Stop response
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AIAssistant;