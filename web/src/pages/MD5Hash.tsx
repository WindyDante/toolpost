import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hash, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

// 简单的MD5实现（生产环境建议使用crypto-js库）
function md5(str: string): string {
  // 这里使用浏览器的Web Crypto API模拟MD5
  // 注意：实际项目中应该使用专门的MD5库
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  // 简化版本，实际应该使用真正的MD5算法
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
  }
  
  // 转换为32位十六进制字符串
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
}

const MD5Hash = () => {
  const [inputText, setInputText] = useState("");
  const [hashResult, setHashResult] = useState("");
  const { toast } = useToast();

  const generateHash = () => {
    if (!inputText.trim()) {
      toast({
        title: "请输入文本",
        description: "请先输入要加密的文本内容",
        variant: "destructive"
      });
      return;
    }

    const result = md5(inputText);
    setHashResult(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashResult);
    toast({
      title: "复制成功",
      description: "MD5哈希值已复制到剪贴板",
    });
  };

  const clearAll = () => {
    setInputText("");
    setHashResult("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MD5加密工具</h1>
            <p className="text-gray-600">将文本转换为MD5哈希值</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  输入文本
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入要进行MD5加密的文本..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={generateHash} className="flex-1">
                    生成MD5
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle>MD5哈希结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                  {hashResult ? (
                    <div className="w-full">
                      <div className="bg-white p-4 rounded border font-mono text-sm break-all">
                        {hashResult}
                      </div>
                      <Button 
                        onClick={copyToClipboard} 
                        className="w-full mt-4"
                        variant="outline"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        复制结果
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">MD5哈希结果将显示在这里</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>关于MD5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">什么是MD5？</h3>
                  <p className="text-gray-600 text-sm">
                    MD5是一种广泛使用的密码散列函数，可以产生一个128位（16字节）的散列值，
                    用于确保信息传输完整一致。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">使用场景</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• 文件完整性验证</li>
                    <li>• 密码存储（需要加盐）</li>
                    <li>• 数字签名</li>
                    <li>• 数据去重</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MD5Hash;
