"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldAlert, Loader2, CheckCircle, AlertTriangle, XCircle, Upload, FileText, Download } from "lucide-react"

type ThreatResult = {
    is_threat: number
    threat_probability: number
    risk_level: string
}

type CSVResult = {
    row: number
    data: Record<string, string | number>
    is_threat: number
    threat_probability: number
    risk_level: string
}

const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp"]
const SERVICE_OPTIONS = ["http", "ftp", "smtp", "ssh", "other"]
const FLAG_OPTIONS = ["SF", "S0", "REJ", "RSTO", "RSTR", "OTH"]

export function ThreatDetector() {
    const [mode, setMode] = useState<"simple" | "batch">("simple")
    const [formData, setFormData] = useState({
        protocol_type: "",
        service: "",
        flag: "",
        duration: "",
        src_bytes: "",
        dst_bytes: "",
        wrong_fragment: "0",
        urgent: "0",
        hot: "0",
        num_failed_logins: "0",
        count: "",
        logged_in: false,
    })

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ThreatResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    const [csvFile, setCSVFile] = useState<File | null>(null)
    const [csvResults, setCSVResults] = useState<CSVResult[]>([])

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            // Convert logged_in boolean to 0 or 1
            const payload = {
                ...formData,
                logged_in: formData.logged_in ? 1 : 0,
                // Convert string numbers to actual numbers
                duration: parseFloat(formData.duration) || 0,
                src_bytes: parseFloat(formData.src_bytes) || 0,
                dst_bytes: parseFloat(formData.dst_bytes) || 0,
                wrong_fragment: parseInt(formData.wrong_fragment) || 0,
                urgent: parseInt(formData.urgent) || 0,
                hot: parseInt(formData.hot) || 0,
                num_failed_logins: parseInt(formData.num_failed_logins) || 0,
                count: parseInt(formData.count) || 0,
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
            const response = await fetch(`${API_URL}/api/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                throw new Error('Detection failed. Please check your backend server.')
            }

            const data = await response.json()
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleCSVUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!csvFile) return

        setLoading(true)
        setError(null)
        setCSVResults([])

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
            
            // Create FormData to send file
            const formData = new FormData()
            formData.append('file', csvFile)

            const response = await fetch(`${API_URL}/api/detect_csv`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'CSV processing failed')
            }

            const data = await response.json()
            
            // Update results from backend response
            setCSVResults(data.results)
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process CSV file')
        } finally {
            setLoading(false)
        }
    }

    const downloadResults = () => {
        if (csvResults.length === 0) return

        const headers = ['Row', 'Threat Status', 'Probability (%)', 'Risk Level', 'Protocol', 'Service', 'Flag']
        const csvContent = [
            headers.join(','),
            ...csvResults.map(r => [
                r.row,
                r.is_threat ? 'Threat' : 'Safe',
                (r.threat_probability * 100).toFixed(2),
                r.risk_level,
                r.data.protocol_type || '',
                r.data.service || '',
                r.data.flag || ''
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `threat_analysis_results_${new Date().getTime()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return 'bg-green-500'
            case 'medium': return 'bg-yellow-500'
            case 'high': return 'bg-orange-500'
            case 'critical': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getRiskIcon = (isThreat: number, level: string) => {
        if (!isThreat) return <CheckCircle className="h-6 w-6 text-green-600" />
        
        switch (level.toLowerCase()) {
            case 'low': return <Shield className="h-6 w-6 text-green-600" />
            case 'medium': return <AlertTriangle className="h-6 w-6 text-yellow-600" />
            case 'high': return <ShieldAlert className="h-6 w-6 text-orange-600" />
            case 'critical': return <XCircle className="h-6 w-6 text-red-600" />
            default: return <Shield className="h-6 w-6" />
        }
    }

    const threatStats = csvResults.length > 0
        ? {
            total: csvResults.length,
            threats: csvResults.filter((r) => r.is_threat).length,
            safe: csvResults.filter((r) => !r.is_threat).length,
            avgProbability: csvResults.reduce((sum, r) => sum + r.threat_probability, 0) / csvResults.length,
        }
        : null

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Shield className="h-6 w-6" />
                                Cyber Threat Detector
                            </CardTitle>
                            <CardDescription className="mt-2">
                                {mode === "simple" 
                                    ? "Analyze network connections for potential security threats"
                                    : "Upload a CSV file to analyze multiple connections at once"}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setMode(mode === "simple" ? "batch" : "simple")
                                setResult(null)
                                setCSVResults([])
                                setCSVFile(null)
                                setError(null)
                            }}
                        >
                            {mode === "simple" ? (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Batch Mode
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Simple Mode
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {mode === "simple" ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Connection Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Connection Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="protocol">Protocol Type *</Label>
                                    <Select
                                        value={formData.protocol_type}
                                        onValueChange={(value) => handleInputChange('protocol_type', value)}
                                    >
                                        <SelectTrigger id="protocol">
                                            <SelectValue placeholder="Select protocol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROTOCOL_OPTIONS.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <select
                                        className="sr-only"
                                        required
                                        value={formData.protocol_type}
                                        onChange={() => {}}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        <option value="">Please select a protocol</option>
                                        {PROTOCOL_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service">Service *</Label>
                                    <Select
                                        value={formData.service}
                                        onValueChange={(value) => handleInputChange('service', value)}
                                    >
                                        <SelectTrigger id="service">
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SERVICE_OPTIONS.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <select
                                        className="sr-only"
                                        required
                                        value={formData.service}
                                        onChange={() => {}}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        <option value="">Please select a service</option>
                                        {SERVICE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="flag">Connection Flag *</Label>
                                    <Select
                                        value={formData.flag}
                                        onValueChange={(value) => handleInputChange('flag', value)}
                                    >
                                        <SelectTrigger id="flag">
                                            <SelectValue placeholder="Select flag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FLAG_OPTIONS.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <select
                                        className="sr-only"
                                        required
                                        value={formData.flag}
                                        onChange={() => {}}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        <option value="">Please select a flag</option>
                                        {FLAG_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Traffic Metrics */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Traffic Metrics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (seconds) *</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        placeholder="0"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange('duration', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="src_bytes">Source Bytes *</Label>
                                    <Input
                                        id="src_bytes"
                                        type="number"
                                        placeholder="0"
                                        value={formData.src_bytes}
                                        onChange={(e) => handleInputChange('src_bytes', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dst_bytes">Destination Bytes *</Label>
                                    <Input
                                        id="dst_bytes"
                                        type="number"
                                        placeholder="0"
                                        value={formData.dst_bytes}
                                        onChange={(e) => handleInputChange('dst_bytes', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Indicators */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Security Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wrong_fragment">Wrong Fragments</Label>
                                    <Input
                                        id="wrong_fragment"
                                        type="number"
                                        placeholder="0"
                                        value={formData.wrong_fragment}
                                        onChange={(e) => handleInputChange('wrong_fragment', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="urgent">Urgent Packets</Label>
                                    <Input
                                        id="urgent"
                                        type="number"
                                        placeholder="0"
                                        value={formData.urgent}
                                        onChange={(e) => handleInputChange('urgent', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hot">Hot Indicators</Label>
                                    <Input
                                        id="hot"
                                        type="number"
                                        placeholder="0"
                                        value={formData.hot}
                                        onChange={(e) => handleInputChange('hot', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="num_failed_logins">Failed Logins</Label>
                                    <Input
                                        id="num_failed_logins"
                                        type="number"
                                        placeholder="0"
                                        value={formData.num_failed_logins}
                                        onChange={(e) => handleInputChange('num_failed_logins', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="count">Connection Count *</Label>
                                    <Input
                                        id="count"
                                        type="number"
                                        placeholder="0"
                                        value={formData.count}
                                        onChange={(e) => handleInputChange('count', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-8">
                                    <Checkbox
                                        id="logged_in"
                                        checked={formData.logged_in}
                                        onCheckedChange={(checked) => handleInputChange('logged_in', checked as boolean)}
                                    />
                                    <Label htmlFor="logged_in" className="cursor-pointer">
                                        Successfully Logged In
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Detect Threat
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleCSVUpload} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="csv-file">CSV File</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                                    required
                                    className="flex-1"
                                />
                                {csvFile && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        <span>{csvFile.name}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                CSV must include: protocol_type, service, flag, duration, src_bytes, dst_bytes, wrong_fragment, urgent, hot, num_failed_logins, count, logged_in
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !csvFile}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing CSV...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Analyze CSV File
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>

            {/* Results */}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {mode === "simple" && result && (
                <Card className={`border-2 ${result.is_threat ? 'border-red-500' : 'border-green-500'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                {getRiskIcon(result.is_threat, result.risk_level)}
                                Analysis Result
                            </span>
                            <Badge className={getRiskColor(result.risk_level)}>
                                {result.risk_level.toUpperCase()}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Threat Status</Label>
                                <p className="text-2xl font-bold">
                                    {result.is_threat ? 'Threat Detected' : 'Safe'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Threat Probability</Label>
                                <p className="text-2xl font-bold">
                                    {(result.threat_probability * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-full ${getRiskColor(result.risk_level)} transition-all duration-500`}
                                style={{ width: `${result.threat_probability * 100}%` }}
                            />
                        </div>

                        {result.is_threat ? (
                            <Alert variant="destructive">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    This connection shows signs of malicious activity. Review the connection details and take appropriate security measures.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>All Clear</AlertTitle>
                                <AlertDescription>
                                    This connection appears to be legitimate with no detected threats.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {mode === "batch" && csvResults.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Analysis Summary</CardTitle>
                                <Button onClick={downloadResults} variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Results
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-muted">
                                    <div className="text-2xl font-bold">{threatStats?.total}</div>
                                    <div className="text-xs text-muted-foreground">Total Analyzed</div>
                                </div>
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <div className="text-2xl font-bold text-red-600">{threatStats?.threats}</div>
                                    <div className="text-xs text-muted-foreground">Threats Detected</div>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                    <div className="text-2xl font-bold text-green-600">{threatStats?.safe}</div>
                                    <div className="text-xs text-muted-foreground">Safe Connections</div>
                                </div>
                                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {((threatStats?.avgProbability || 0) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Avg Threat Probability</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Results ({csvResults.length} rows)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {csvResults.map((result) => (
                                    <div
                                        key={result.row}
                                        className={`p-4 rounded-lg border-2 ${
                                            result.is_threat 
                                                ? 'bg-red-50 border-red-200' 
                                                : 'bg-green-50 border-green-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getRiskIcon(result.is_threat, result.risk_level)}
                                                <span className="font-medium">Row {result.row}</span>
                                                <Badge className={getRiskColor(result.risk_level)}>
                                                    {result.risk_level}
                                                </Badge>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {(result.threat_probability * 100).toFixed(2)}% probability
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {result.data.protocol_type} · {result.data.service} · {result.data.flag} · 
                                            {result.data.duration}s · {result.data.src_bytes} bytes
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}