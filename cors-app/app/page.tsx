"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
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
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CORSContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [origin, setOrigin] = useState("");
  const [method, setMethod] = useState("GET");
  const [result, setResult] = useState<{
    status?: number;
    statusText?: string;
    corsHeaders?: Record<string, string | null>;
    allHeaders?: Record<string, string>;
    error?: string;
    data?: any;
  } | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [notification, setNotification] = useState("");
  const [isResultExpanded, setIsResultExpanded] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [headersText, setHeadersText] = useState(
    '{\n  "Content-Type": "application/json"\n}'
  );
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
  });
  const [graphqlQuery, setGraphqlQuery] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("cors");
  const [rawBody, setRawBody] = useState("");
  const [bodyType, setBodyType] = useState<"none" | "graphql" | "raw">("none");

  useEffect(() => {
    const queryUrl = searchParams?.get("url");
    const queryOrigin = searchParams?.get("origin");
    const queryMethod = searchParams?.get("method");
    const queryHeaders = searchParams?.get("headers");
    const queryGraphql = searchParams?.get("graphql");
    const queryRawBody = searchParams?.get("rawBody");
    const queryBodyType = searchParams?.get("bodyType");

    if (queryUrl) setUrl(queryUrl);
    if (queryOrigin) setOrigin(queryOrigin);
    if (queryMethod) setMethod(queryMethod);
    if (queryHeaders) {
      try {
        const decodedHeaders = JSON.parse(atob(queryHeaders));
        setHeaders(decodedHeaders);
        setHeadersText(JSON.stringify(decodedHeaders, null, 2));
      } catch (e) {
        console.error("Failed to parse headers from URL");
      }
    }
    if (queryGraphql) {
      try {
        setGraphqlQuery(atob(queryGraphql));
        setBodyType("graphql");
      } catch (e) {
        console.error("Failed to parse GraphQL query from URL");
      }
    }
    if (queryRawBody) {
      try {
        setRawBody(atob(queryRawBody));
        setBodyType("raw");
      } catch (e) {
        console.error("Failed to parse raw body from URL");
      }
    }
    if (queryBodyType) {
      setBodyType(queryBodyType as "none" | "graphql" | "raw");
    }
  }, [searchParams]);

  useEffect(() => {
    if (url || origin || method) {
      generateShareLink();
    }
  }, [url, origin, method]);

  const handleTest = async () => {
    if (!url.trim()) {
      setUrlError("Please enter a URL to test");
      return;
    }
    setUrlError("");
    setIsLoading(true);
    try {
      const requestHeaders: Record<string, string> = {
        Origin: origin || window.location.origin,
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Handle request body based on type
      if (method !== "GET" && method !== "HEAD") {
        if (bodyType === "graphql" && graphqlQuery) {
          requestOptions.body = JSON.stringify({
            query: graphqlQuery,
          });
        } else if (bodyType === "raw" && rawBody) {
          requestOptions.body = rawBody;
        }
      }

      const response = await fetch(url, requestOptions);

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

      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        corsHeaders,
        allHeaders: Object.fromEntries(response.headers.entries()),
        data: parsedData,
      });

      // Switch to response tab if test is successful and there's valid data
      if (response.status === 200 && parsedData) {
        setActiveTab("response");
      }

      generateShareLink();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while testing CORS";
      setResult({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    if (url) params.set("url", url);
    if (origin) params.set("origin", origin);
    if (method) params.set("method", method);

    // Encode advanced options if they exist
    if (Object.keys(headers).length > 0) {
      params.set("headers", btoa(JSON.stringify(headers)));
    }
    if (bodyType !== "none") {
      params.set("bodyType", bodyType);
      if (bodyType === "graphql" && graphqlQuery) {
        params.set("graphql", btoa(graphqlQuery));
      } else if (bodyType === "raw" && rawBody) {
        params.set("rawBody", btoa(rawBody));
      }
    }

    const link = `${baseUrl}?${params.toString()}`;
    setShareLink(link);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setNotification("Link copied to clipboard!");
      setTimeout(() => setNotification(""), 3000);
    });
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <main className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
            <Image
              src="/detective-otter.png"
              alt="Detective Otter Logo"
              width={80}
              height={80}
              priority
              className="hover:scale-110 transition-transform duration-200"
            />
          </div>
          <h1 className="text-3xl font-bold">CORS Tester</h1>
        </div>

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
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError("");
                }}
                placeholder="https://example.com/api"
                className={urlError ? "border-red-500" : ""}
              />
              {urlError && (
                <p className="text-sm text-red-500 mt-1">{urlError}</p>
              )}
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
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Advanced Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  {showAdvancedOptions ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span className="ml-2">Hide Options</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span className="ml-2">Show Options</span>
                    </>
                  )}
                </Button>
              </div>

              {showAdvancedOptions && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="headers">Headers (JSON format):</Label>
                    <textarea
                      id="headers"
                      className="w-full min-h-[100px] p-2 border rounded-md font-mono text-sm"
                      value={headersText}
                      onChange={(e) => {
                        setHeadersText(e.target.value);
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setHeaders(parsed);
                        } catch {
                          // Allow invalid JSON while typing
                        }
                      }}
                      placeholder='{
  "Content-Type": "application/json",
  "Authorization": "Bearer token",
  "Custom-Header": "value"
}'
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Request Body:</Label>
                    <Select
                      value={bodyType}
                      onValueChange={(value: "none" | "graphql" | "raw") =>
                        setBodyType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-950">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="graphql">GraphQL Query</SelectItem>
                        <SelectItem value="raw">Raw Body</SelectItem>
                      </SelectContent>
                    </Select>

                    {bodyType === "graphql" && (
                      <div className="space-y-2">
                        <Label htmlFor="graphqlQuery">GraphQL Query:</Label>
                        <textarea
                          id="graphqlQuery"
                          className="w-full min-h-[200px] p-2 border rounded-md font-mono text-sm"
                          value={graphqlQuery}
                          onChange={(e) => setGraphqlQuery(e.target.value)}
                          placeholder={`query MyQuery {
  getStarredPublicArtifacts(userStars: true) {
    message
    valid
    artifacts {
      author
      description
      id
    }
  }
}`}
                        />
                      </div>
                    )}

                    {bodyType === "raw" && (
                      <div className="space-y-2">
                        <Label htmlFor="rawBody">Raw Body:</Label>
                        <textarea
                          id="rawBody"
                          className="w-full min-h-[200px] p-2 border rounded-md font-mono text-sm"
                          value={rawBody}
                          onChange={(e) => setRawBody(e.target.value)}
                          placeholder='{
  "key": "value",
  "array": [1, 2, 3],
  "nested": {
    "field": "value"
  }
}'
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Result</CardTitle>
                <div className="flex items-center gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="cors"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cors">CORS Headers</TabsTrigger>
                  <TabsTrigger value="headers">All Headers</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>
                <TabsContent value="cors">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                    {JSON.stringify(result.corsHeaders, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="headers">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                    {JSON.stringify(result.allHeaders, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="response">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                    {typeof result.data === "object"
                      ? JSON.stringify(result.data, null, 2)
                      : result.data}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
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
                <strong>PUT / POST / DELETE / PATCH:</strong> Also available for
                other testing purposes.
              </li>
            </ul>
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
              headers.
            </p>
          </CardContent>
        </Card>
        <footer className="text-center text-sm text-gray-500 mt-8 pb-4">
          Created by{" "}
          <a
            href="https://github.com/MrMarciaOng"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Marcia Ong
          </a>
        </footer>
      </main>
    </div>
  );
}

export default function CORSTester() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CORSContent />
    </Suspense>
  );
}
