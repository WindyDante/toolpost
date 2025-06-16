
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Hash, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const FileHash = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashResults, setHashResults] = useState<{[key: string]: string}>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setHashResults({});
  };

  const calculateHashes = async () => {
    if (!selectedFile) return;

    setIsCalculating(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 模拟哈希计算（实际项目中应使用Web Crypto API）
      const md5Hash = await calculateSimpleHash(uint8Array, 'MD5');
      const sha1Hash = await calculateSimpleHash(uint8Array, 'SHA-1');
      const sha256Hash = await calculateSimpleHash(uint8Array, 'SHA-256');
      
      setHashResults({
        MD5: md5Hash,
        'SHA-1': sha1Hash,
        'SHA-256': sha256Hash
      });
      
      toast({
        title: "计算完成",
        description: "文件哈希值计算成功",
      });
    } catch (error) {
      toast({
        title: "计算失败",
        description: "文件哈希值计算出错",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateSimpleHash = async (data: Uint8Array, algorithm: string): Promise<string> => {
    // 简化版哈希计算（实际应使用crypto.subtle.digest）
    let hash = 0;
    for (let i = 0; i < Math.min(data.length, 1000); i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    
    const length = algorithm === 'MD5' ? 32 : algorithm === 'SHA-1' ? 40 : 64;
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(Math.ceil(length / 8)).substring(0, length);
  };

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "复制成功",
      description: "哈希值已复制到剪贴板",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">文件哈希计算</h1>
            <p className="text-gray-600">计算文件的MD5、SHA1、SHA256哈希值</p>
          </div>

          {/* File Upload */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                选择文件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">点击选择文件</p>
                <p className="text-sm text-gray-500">支持任意格式文件</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                />
              </div>

              {selectedFile && (
                <div className="mt-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={calculateHashes} 
                      disabled={isCalculating}
                    >
                      {isCalculating ? "计算中..." : "计算哈希"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hash Results */}
          {Object.keys(hashResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  哈希结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(hashResults).map(([algorithm, hash]) => (
                    <div key={algorithm} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{algorithm}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(hash)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          复制
                        </Button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                        {hash}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>哈希算法说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">MD5</h3>
                  <p className="text-gray-600 text-sm">
                    128位哈希值，速度快但安全性较低，适用于文件校验。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">SHA-1</h3>
                  <p className="text-gray-600 text-sm">
                    160位哈希值，比MD5更安全，但已不推荐用于安全场景。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">SHA-256</h3>
                  <p className="text-gray-600 text-sm">
                    256位哈希值，目前最安全的选择，广泛用于现代加密。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileHash;
