
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FileTransfer from "./pages/FileTransfer";
import MD5Hash from "./pages/MD5Hash";
import FileHash from "./pages/FileHash";
import Base64 from "./pages/Base64";
import JsonFormatter from "./pages/JsonFormatter";
import ColorPreview from "./pages/ColorPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/file-transfer" element={<FileTransfer />} />
          <Route path="/md5-hash" element={<MD5Hash />} />
          <Route path="/file-hash" element={<FileHash />} />
          <Route path="/base64" element={<Base64 />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/color-preview" element={<ColorPreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
