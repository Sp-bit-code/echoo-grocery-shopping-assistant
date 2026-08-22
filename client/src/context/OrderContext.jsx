import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [latestOrder, setLatestOrder] = useState(null);

  const value = useMemo(
    () => ({
      latestOrder,
      setLatestOrder,
      clearLatestOrder: () => setLatestOrder(null),
    }),
    [latestOrder]
  );

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrderContext must be used within OrderProvider"
    );
  }

  return context;
};

export default OrderContext;