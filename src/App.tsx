import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Start from "./pages/Start";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Reception from "./pages/Reception";
import Kitchen from "./pages/Kitchen";
import NotFound from "./pages/NotFound";
import CartDrawer from "@/components/CartDrawer";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <CartDrawer />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Start />} />
                <Route path="/menu" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/*" element={
                  <RequireAuth allowed={["admin", "owner"]}>
                    <Admin />
                  </RequireAuth>
                } />
                <Route path="/reception" element={
                  <RequireAuth allowed={["admin", "owner", "reception"]}>
                    <Reception />
                  </RequireAuth>
                } />
                <Route path="/kitchen" element={
                  <RequireAuth allowed={["admin", "owner", "cook"]}>
                    <Kitchen />
                  </RequireAuth>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
