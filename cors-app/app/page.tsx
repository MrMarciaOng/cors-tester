"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

export default function CORSTester() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [origin, setOrigin] = useState("");
  const [method, setMethod] = useState("GET");
  const [result, setResult] = useState<any>(null);
  const [shareLink, setShareLink] = useState("");
  const [notification, setNotification] = useState("");
  const [isResultExpanded, setIsResultExpanded] = useState(false);

  useEffect(() => {
    const queryUrl = searchParams?.get("url");
    const queryOrigin = searchParams?.get("origin");
    const queryMethod = searchParams?.get("method");
    if (queryUrl) setUrl(queryUrl);
    if (queryOrigin) setOrigin(queryOrigin);
    if (queryMethod) setMethod(queryMethod);
  }, [searchParams]);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Origin: origin || window.location.origin,
        },
      });

      const corsHeaders = {
        "Access-Control-Allow-Origin": response.headers.get(
          "Access-Control-Allow-Origin"
        ),
        "Access-Control-Allow-Methods": response.headers.get(
          "Access-Control-Allow-Methods"
        ),
        "Access-Control-Allow-Headers": response.headers.get(
          "Access-Control-Allow-Headers"
        ),
        "Access-Control-Allow-Credentials": response.headers.get(
          "Access-Control-Allow-Credentials"
        ),
      };

      setResult({
        status: response.status,
        statusText: response.statusText,
        corsHeaders,
        allHeaders: Object.fromEntries(response.headers.entries()),
      });
      generateShareLink();
    } catch (error) {
      setResult({ error: "An error occurred while testing CORS" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const queryParams = new URLSearchParams({ url, origin, method }).toString();
    const link = `${baseUrl}?${queryParams}`;
    setShareLink(link);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setNotification("Link copied to clipboard!");
      setTimeout(() => setNotification(""), 3000);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <main className="space-y-8">
        <h1 className="text-3xl font-bold">CORS Tester</h1>

        <Card>
          <CardHeader>
            <CardTitle>Test CORS</CardTitle>
            <CardDescription>
              Enter the details below to test CORS for any URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL to test:</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origin header:</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="https://yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method:</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950">
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTest} disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Testing...
                </>
              ) : (
                "Test"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between"
              onClick={() => setIsResultExpanded(!isResultExpanded)}
            >
              <div className="flex items-center gap-2">
                <CardTitle>Result</CardTitle>
                {result.status === 200 ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Pass</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Fail</span>
                  </div>
                )}
              </div>
              {isResultExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CardHeader>
            {isResultExpanded && (
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        )}

        {shareLink && (
          <Card>
            <CardHeader>
              <CardTitle>Share Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input value={shareLink} readOnly />
                <Button onClick={copyShareLink}>Copy</Button>
              </div>
              {notification && (
                <Alert className="mt-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{notification}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What is CORS?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              CORS (Cross-Origin Resource Sharing) is a security mechanism that
              allows a server to indicate which origins can access its
              resources. Browsers prevent scripts from accessing resources on
              different domains for security reasons. For example, a script on
              google.com might not be able to access a resource on
              example.com/font.ttf without proper CORS headers.
            </p>
            <p className="mb-4">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about CORS
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What does this site do?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This site allows you to test CORS by making a request to any URL
              you provide. It will check if the server returns valid CORS
              headers. This tool is open source and available on GitHub.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Which HTTP method should I use?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside">
              <li>
                <strong>GET:</strong> For loading a script, font, or any static
                resource.
              </li>
              <li>
                <strong>OPTIONS:</strong> For sending an AJAX request and
                checking the preflight request.
              </li>
              <li>
                <strong>PUT / POST / DELETE / PATCH:</strong> Also available for other testing
                purposes.
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
