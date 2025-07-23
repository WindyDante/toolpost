import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, Copy, Share2, FileText, X, Folder, Lock, Eye, EyeOff, Flame, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import JSZip from 'jszip';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: 'file' | 'folder';
  url: string;
  path: string;
}

interface SharedFolder {
  id: string;
  name: string;
  accessCode: string;
  files: FileItem[];
  textContent?: string;
  createdAt: string;
  expiresAt: string;
  burnAfterReading: boolean;
  isDeleted: boolean;
}

const FileTransfer = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState("");
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [burnAfterReading, setBurnAfterReading] = useState(false);
  const [expirationTime, setExpirationTime] = useState("24h");
  const [accessingCode, setAccessingCode] = useState("");
  const [currentFolder, setCurrentFolder] = useState<SharedFolder | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load shared folders from localStorage on component mount
  useEffect(() => {
    const savedFolders = localStorage.getItem('sharedFolders');
    if (savedFolders) {
      try {
        const parsedFolders = JSON.parse(savedFolders);
        setSharedFolders(parsedFolders);
      } catch (error) {
        console.error('Failed to parse saved folders:', error);
      }
    }
  }, []);

  // Save shared folders to localStorage whenever sharedFolders changes
  useEffect(() => {
    localStorage.setItem('sharedFolders', JSON.stringify(sharedFolders));
  }, [sharedFolders]);

  // 测试localStorage功能
  const testLocalStorage = () => {
    const testData = {
      'TEST123': 'http://localhost:6332/share/download?key=test&code=TEST123'
    };
    localStorage.setItem('downloadLinks', JSON.stringify(testData));
    console.log('测试数据已保存到localStorage');

    const loaded = JSON.parse(localStorage.getItem('downloadLinks') || '{}');
    console.log('从localStorage加载的数据:', loaded);
  };

  const getExpirationMilliseconds = (timeValue: string) => {
    const timeMap: { [key: string]: number } = {
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "12h": 12 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "48h": 48 * 60 * 60 * 1000,
      "72h": 72 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    return timeMap[timeValue] || 24 * 60 * 60 * 1000;
  };

  const getExpirationLabel = (timeValue: string) => {
    const labelMap: { [key: string]: string } = {
      "1h": "1小时",
      "6h": "6小时",
      "12h": "12小时",
      "24h": "24小时",
      "48h": "48小时",
      "72h": "72小时",
      "7d": "7天",
      "30d": "30天",
    };
    return labelMap[timeValue] || "24小时";
  };

  const getExpirationValues = (timeValue: string) => {
    // 将前端时间格式转换为后端需要的 expireTime 和 expireUnit
    const valueMap: { [key: string]: { expireTime: number, expireUnit: number } } = {
      "1h": { expireTime: 1, expireUnit: 3600 },     // 1小时，单位秒
      "6h": { expireTime: 6, expireUnit: 3600 },     // 6小时，单位秒
      "12h": { expireTime: 12, expireUnit: 3600 },   // 12小时，单位秒
      "24h": { expireTime: 24, expireUnit: 3600 },   // 24小时，单位秒
      "48h": { expireTime: 48, expireUnit: 3600 },   // 48小时，单位秒
      "72h": { expireTime: 72, expireUnit: 3600 },   // 72小时，单位秒
      "7d": { expireTime: 7, expireUnit: 86400 },    // 7天，单位秒（1天=86400秒）
      "30d": { expireTime: 30, expireUnit: 86400 },  // 30天，单位秒
    };
    return valueMap[timeValue] || { expireTime: 24, expireUnit: 3600 };
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const markFolderAsDeleted = (folderId: string) => {
    setSharedFolders(prev =>
      prev.map(folder =>
        folder.id === folderId
          ? { ...folder, isDeleted: true }
          : folder
      )
    );
  };

  const deleteSharedFolder = (folderId: string) => {
    setSharedFolders(prev => prev.filter(folder => folder.id !== folderId));
    toast({
      title: "删除成功",
      description: "分享记录已删除",
    });
  };

  const handleFileSelect = (selectedFiles: FileList | null, isFolder = false) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const items = Array.from(e.dataTransfer.items);
    const newFiles: File[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await processEntry(entry, newFiles);
        }
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const processEntry = async (entry: any, files: File[]): Promise<void> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file: File) => {
          // 设置文件的相对路径
          Object.defineProperty(file, 'webkitRelativePath', {
            value: entry.fullPath.substring(1), // 移除开头的 "/"
            writable: false
          });
          files.push(file);
          resolve();
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        reader.readEntries(async (entries: any[]) => {
          for (const childEntry of entries) {
            await processEntry(childEntry, files);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFileByCode = async (code: string) => {
    try {
      // 首先检查localStorage中是否有缓存的下载链接
      const cachedShares = JSON.parse(localStorage.getItem('downloadLinks') || '{}');
      if (cachedShares[code]) {
        // 使用缓存的下载链接
        const downloadUrl = cachedShares[code];
        window.open(downloadUrl, '_blank');
        return;
      }

      // 调用后端API获取下载链接
      const response = await fetch(`http://localhost:6332/api/share/${code}`);
      const result = await response.json();

      if (result.code === 1) {
        // 成功获取下载链接
        const downloadUrl = result.data;

        // 存储到localStorage
        const existingShares = JSON.parse(localStorage.getItem('downloadLinks') || '{}');
        existingShares[code] = downloadUrl;
        localStorage.setItem('downloadLinks', JSON.stringify(existingShares));

        // 打开下载链接
        window.open(downloadUrl, '_blank');

        toast({
          title: "下载开始",
          description: `文件下载已开始，访问码: ${code}`,
        });
      } else {
        // 错误响应
        toast({
          title: "下载失败",
          description: result.msg || "分享不存在或已过期",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "下载失败",
        description: "网络错误或服务器不可用",
        variant: "destructive"
      });
    }
  };

  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要下载的文件",
        variant: "destructive"
      });
      return;
    }

    // 检查是否为阅后即焚文件夹
    if (currentFolder!.burnAfterReading) {
      markFolderAsDeleted(currentFolder!.id);

      toast({
        title: "阅后即焚",
        description: "文件已下载，分享已自动删除",
      });
    }

    const filesToDownload = currentFolder!.files.filter(file =>
      file.type === 'file' && selectedFiles.includes(file.id)
    );

    if (filesToDownload.length === 1) {
      // 单个文件直接下载
      const file = filesToDownload[0];
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "下载成功",
        description: `文件 ${file.name} 已下载`,
      });
    } else {
      // 多个文件打包下载
      const zip = new JSZip();

      try {
        const filePromises = filesToDownload.map(async (file) => {
          const response = await fetch(file.url);
          const blob = await response.blob();
          zip.file(file.name, blob);
        });

        await Promise.all(filePromises);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected_files_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "下载成功",
          description: `已打包下载 ${filesToDownload.length} 个文件`,
        });
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "下载失败",
          description: "文件下载过程中出现错误",
          variant: "destructive"
        });
      }
    }

    setSelectedFiles([]);
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    const allFileIds = currentFolder!.files
      .filter(file => file.type === 'file')
      .map(file => file.id);

    if (selectedFiles.length === allFileIds.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(allFileIds);
    }
  };

  const downloadFolder = async (folderName: string) => {
    // 检查是否为阅后即焚文件夹
    if (currentFolder!.burnAfterReading) {
      markFolderAsDeleted(currentFolder!.id);

      toast({
        title: "阅后即焚",
        description: "文件已下载，分享已自动删除",
      });
    }

    const folderFiles = currentFolder!.files.filter(file =>
      file.type === 'file' && file.path.startsWith(folderName + '/')
    );

    if (folderFiles.length === 0) {
      toast({
        title: "下载失败",
        description: "文件夹中没有文件",
        variant: "destructive"
      });
      return;
    }

    const zip = new JSZip();

    try {
      // 为每个文件创建一个下载promise
      const filePromises = folderFiles.map(async (file) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const relativePath = file.path.substring(folderName.length + 1); // 移除文件夹前缀
        zip.file(relativePath, blob);
      });

      await Promise.all(filePromises);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "下载成功",
        description: `文件夹 ${folderName} 已打包下载`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "下载失败",
        description: "文件夹下载过程中出现错误",
        variant: "destructive"
      });
    }
  };

  const createSharedFolder = async () => {
    if (files.length === 0 && !textContent.trim()) {
      toast({
        title: "请添加内容",
        description: "请上传文件或输入文字信息",
        variant: "destructive"
      });
      return;
    }

    try {
      // 准备上传数据
      const formData = new FormData();

      // 添加文件（如果有）
      if (files.length > 0) {
        // 目前只支持单文件上传，取第一个文件
        formData.append('file', files[0]);
      }

      // 添加文本内容
      if (textContent.trim()) {
        formData.append('text', textContent.trim());
      }

      // 添加自定义访问码
      if (useCustomCode && customCode) {
        formData.append('code', customCode);
      }

      // 处理过期时间
      const { expireTime, expireUnit } = getExpirationValues(expirationTime);
      formData.append('expireTime', expireTime.toString());
      formData.append('expireUnit', expireUnit.toString());

      // 调用后端API
      const response = await fetch('http://localhost:6332/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.code === 1) {
        // 成功响应
        const { fileUrl, code } = result.data;

        // 存储到localStorage
        const shareData = {
          fileUrl,
          code,
          textContent: textContent.trim() || undefined,
          createdAt: new Date().toISOString(),
          expirationTime
        };

        const existingShares = JSON.parse(localStorage.getItem('fileShares') || '[]');
        existingShares.push(shareData);
        localStorage.setItem('fileShares', JSON.stringify(existingShares));

        // 创建本地显示的文件夹（用于UI显示）
        const folderId = Math.random().toString(36).substr(2, 9);
        const fileItems: FileItem[] = files.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: 'file' as const,
          url: fileUrl,
          path: file.webkitRelativePath || file.name
        }));

        const organizedFiles = organizeFiles(fileItems);
        const expirationMs = getExpirationMilliseconds(expirationTime);
        const expirationLabel = getExpirationLabel(expirationTime);

        const newFolder: SharedFolder = {
          id: folderId,
          name: `内容分享-${new Date().toLocaleDateString()}`,
          accessCode: code,
          files: organizedFiles,
          textContent: textContent.trim() || undefined,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + expirationMs).toISOString(),
          burnAfterReading: burnAfterReading,
          isDeleted: false
        };

        setSharedFolders(prev => [...prev, newFolder]);
        setFiles([]);
        setTextContent("");
        setAccessCode(code);
        setCustomCode("");
        setBurnAfterReading(false);

        const burnText = burnAfterReading ? "，阅后即焚已启用" : "";
        const contentType = files.length > 0 && textContent.trim() ? "文件和文字" :
          files.length > 0 ? "文件" : "文字";
        toast({
          title: "分享创建成功",
          description: `${contentType}分享已创建，访问码: ${code}，有效期${expirationLabel}${burnText}`,
        });
      } else {
        // 错误响应
        toast({
          title: "分享创建失败",
          description: result.msg || "服务器错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "上传失败",
        description: "网络错误或服务器不可用",
        variant: "destructive"
      });
    }
  };

  const organizeFiles = (files: FileItem[]): FileItem[] => {
    const folderMap = new Map<string, FileItem[]>();
    const rootFiles: FileItem[] = [];

    files.forEach(file => {
      const pathParts = file.path.split('/');
      if (pathParts.length > 1) {
        const folderName = pathParts[0];
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, []);
        }
        folderMap.get(folderName)!.push(file);
      } else {
        rootFiles.push(file);
      }
    });

    const result: FileItem[] = [...rootFiles];

    folderMap.forEach((folderFiles, folderName) => {
      result.push({
        id: Math.random().toString(36).substr(2, 9),
        name: folderName,
        size: folderFiles.reduce((sum, f) => sum + f.size, 0),
        type: 'folder',
        url: '',
        path: folderName
      });
      result.push(...folderFiles);
    });

    return result;
  };

  const accessSharedFolder = async () => {
    if (!accessingCode.trim()) {
      toast({
        title: "请输入访问码",
        description: "访问码不能为空",
        variant: "destructive"
      });
      return;
    }

    try {
      // 首先检查localStorage中是否有缓存的下载链接
      const cachedShares = JSON.parse(localStorage.getItem('downloadLinks') || '{}');
      if (cachedShares[accessingCode]) {
        // 使用缓存的下载链接
        const downloadUrl = cachedShares[accessingCode];
        await handleDownloadWithUrl(downloadUrl, accessingCode);
        return;
      }

      // 调用后端API获取下载链接
      const response = await fetch(`http://localhost:6332/api/share/${accessingCode}`);
      const result = await response.json();

      if (result.code === 1) {
        // 成功获取下载链接
        const downloadUrl = result.data;

        // 存储到localStorage
        const existingShares = JSON.parse(localStorage.getItem('downloadLinks') || '{}');
        existingShares[accessingCode] = downloadUrl;
        localStorage.setItem('downloadLinks', JSON.stringify(existingShares));

        // 处理下载
        await handleDownloadWithUrl(downloadUrl, accessingCode);

        toast({
          title: "访问成功",
          description: `获取到分享内容，访问码: ${accessingCode}`,
        });
      } else {
        // 错误响应
        toast({
          title: "访问失败",
          description: result.msg || "分享不存在或已过期",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Access error:', error);

      // 如果网络错误，尝试从本地查找
      const folder = sharedFolders.find(f => f.accessCode === accessingCode);
      if (folder) {
        if (folder.isDeleted) {
          toast({
            title: "访问失败",
            description: "该分享已被删除（阅后即焚）",
            variant: "destructive"
          });
          return;
        }

        if (new Date() > new Date(folder.expiresAt)) {
          toast({
            title: "访问失败",
            description: "该分享已过期",
            variant: "destructive"
          });
          return;
        }

        setCurrentFolder(folder);
        setAccessingCode("");
        setShowAccessCodeInput(false);

        // 如果是阅后即焚文件夹，在查看时就标记为删除
        if (folder.burnAfterReading) {
          markFolderAsDeleted(folder.id);
          toast({
            title: "访问成功",
            description: `正在查看: ${folder.name}（阅后即焚已触发）`,
          });
        } else {
          toast({
            title: "访问成功",
            description: `正在查看: ${folder.name}`,
          });
        }
      } else {
        toast({
          title: "访问失败",
          description: "网络错误或服务器不可用",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownloadWithUrl = async (downloadUrl: string, code: string) => {
    try {
      // 创建下载链接
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 清理访问码输入
      setAccessingCode("");
      setShowAccessCodeInput(false);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "下载失败",
        description: "无法下载文件",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "复制成功",
      description: "内容已复制到剪贴板",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 检查是否有内容可以分享
  const hasContentToShare = files.length > 0 || textContent.trim();

  if (currentFolder) {
    const fileItems = currentFolder.files.filter(file => file.type === 'file');
    const allFileIds = fileItems.map(file => file.id);
    const isAllSelected = selectedFiles.length === allFileIds.length && allFileIds.length > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  {currentFolder.name}
                  {currentFolder.burnAfterReading && (
                    <span>
                      <Flame className="w-6 h-6 text-red-500" />
                    </span>
                  )}
                </h1>
                <p className="text-gray-600">
                  访问码: {currentFolder.accessCode}
                  {currentFolder.burnAfterReading && (
                    <span className="ml-2 text-red-600 text-sm">• 阅后即焚已启用</span>
                  )}
                </p>
              </div>
              <Button onClick={() => setCurrentFolder(null)} variant="outline">
                返回主页
              </Button>
            </div>

            {/* Text Content Display */}
            {currentFolder.textContent && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    文字信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {currentFolder.textContent}
                    </pre>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => copyToClipboard(currentFolder.textContent!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      复制文字
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Files List */}
            {fileItems.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      文件列表
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {selectedFiles.length > 0 && (
                        <Button onClick={downloadSelectedFiles}>
                          <Download className="w-4 h-4 mr-2" />
                          下载选中文件 ({selectedFiles.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead>大小</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fileItems.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedFiles.includes(file.id)}
                              onCheckedChange={() => toggleFileSelection(file.id)}
                            />
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-500" />
                            {file.name}
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              onClick={() => {
                                if (currentFolder!.burnAfterReading) {
                                  markFolderAsDeleted(currentFolder!.id);
                                  toast({
                                    title: "阅后即焚",
                                    description: "文件已下载，分享已自动删除",
                                  });
                                }
                              }}
                            >
                              <a href={file.url} download={file.name}>
                                <Download className="w-4 h-4 mr-1" />
                                下载
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">文件中转</h1>
            <p className="text-gray-600">上传文件、发送文字信息，生成验证码，安全分享内容</p>
          </div>

          {/* Access Shared Folder */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                访问分享
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="请输入验证码"
                    value={accessingCode}
                    onChange={(e) => setAccessingCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={accessSharedFolder}>
                    访问
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => accessingCode.trim() && downloadFileByCode(accessingCode.trim())}
                    disabled={!accessingCode.trim()}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  输入验证码后，可以点击"访问"查看内容或直接点击"下载"获取文件
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Text Content Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                文字信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="textContent">输入要分享的文字内容</Label>
                  <Textarea
                    id="textContent"
                    placeholder="在这里输入文字信息，支持多行文本..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[120px] mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    字符数: {textContent.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                上传文件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">拖拽文件或文件夹到此处，或点击选择</p>
                  <p className="text-sm text-gray-500">支持任意格式文件和完整文件夹，最大50MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    选择文件
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    选择文件夹
                  </Button>
                  <input
                    ref={folderInputRef}
                    type="file"
                    {...({ webkitdirectory: "" } as any)}
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files, true)}
                  />
                </div>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">待上传文件：</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                              {file.webkitRelativePath && (
                                <span className="ml-2 text-blue-600">({file.webkitRelativePath})</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unified Share Settings - only show when there's content to share */}
          {hasContentToShare && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  分享设置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customCode"
                      checked={useCustomCode}
                      onChange={(e) => setUseCustomCode(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="customCode">自定义验证码</Label>
                  </div>

                  {useCustomCode && (
                    <Input
                      placeholder="输入自定义验证码"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                    />
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="burnAfterReading"
                      checked={burnAfterReading}
                      onChange={(e) => setBurnAfterReading(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="burnAfterReading" className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      阅后即焚
                    </Label>
                  </div>

                  {burnAfterReading && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        ⚠️ 启用阅后即焚后，其他用户查看或下载内容后，分享将立即被删除且无法恢复。
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="expiration">过期时间</Label>
                    <Select value={expirationTime} onValueChange={setExpirationTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择过期时间" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1小时</SelectItem>
                        <SelectItem value="6h">6小时</SelectItem>
                        <SelectItem value="12h">12小时</SelectItem>
                        <SelectItem value="24h">24小时</SelectItem>
                        <SelectItem value="48h">48小时</SelectItem>
                        <SelectItem value="72h">72小时</SelectItem>
                        <SelectItem value="7d">7天</SelectItem>
                        <SelectItem value="30d">30天</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={createSharedFolder} className="w-full" size="lg">
                    <Share2 className="w-4 h-4 mr-2" />
                    创建分享
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Access Code */}
          {accessCode && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  分享已创建
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-800">验证码: {accessCode}</p>
                    <p className="text-sm text-green-600">请将此验证码分享给需要访问的用户</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(accessCode)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadFileByCode(accessCode)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shared Folders List */}
          {sharedFolders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  我的分享
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sharedFolders.map((folder) => (
                    <div key={folder.id} className={`p-4 border rounded-lg ${folder.isDeleted ? 'bg-red-50 border-red-200' : ''}`}>
                      {/* Mobile-first responsive layout */}
                      <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
                        {/* Content section */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {folder.textContent && folder.files.length > 0 ? (
                              <>
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                <FileText className="w-5 h-5 text-green-500" />
                              </>
                            ) : folder.textContent ? (
                              <MessageSquare className="w-5 h-5 text-blue-500" />
                            ) : (
                              <Folder className="w-5 h-5 text-blue-500" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium break-words">
                                {folder.name}
                              </p>
                              {folder.burnAfterReading && (
                                <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                              {folder.isDeleted && (
                                <span className="text-red-600 text-sm whitespace-nowrap">(已删除)</span>
                              )}
                            </div>

                            <div className="text-sm text-gray-500 space-y-1">
                              <p className="break-words">
                                {folder.textContent && folder.files.length > 0
                                  ? `${folder.files.length} 个文件 + 文字信息`
                                  : folder.textContent
                                    ? "文字信息"
                                    : `${folder.files.length} 个文件`
                                }
                              </p>
                              <p className="break-all">
                                验证码: {folder.accessCode}
                                {folder.burnAfterReading && (
                                  <span className="text-red-600"> • 阅后即焚</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 break-words">
                                过期时间: {new Date(folder.expiresAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions section */}
                        <div className="flex gap-2 flex-wrap md:flex-nowrap md:ml-4">
                          {!folder.isDeleted ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(folder.accessCode)}
                                className="flex-1 md:flex-none"
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                <span className="md:inline">复制码</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFileByCode(folder.accessCode)}
                                className="flex-1 md:flex-none"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                <span className="md:inline">下载</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentFolder(folder)}
                                className="flex-1 md:flex-none"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                <span className="md:inline">查看</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSharedFolder(folder.id)}
                                className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="md:inline">删除</span>
                              </Button>
                            </>
                          ) : (
                            <span className="text-red-600 text-sm px-3 py-1 bg-red-100 rounded whitespace-nowrap">
                              已删除
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileTransfer;
