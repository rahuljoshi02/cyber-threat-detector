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
import { Shield, ShieldAlert, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

type ThreatResult = {
    is_threat: number
    threat_probability: number
    risk_level: string
}

const PROTOCOL_OPTIONS = ["tcp", "udp", "icmp"]
const SERVICE_OPTIONS = ["http", "ftp", "smtp", "ssh", "other"]
const FLAG_OPTIONS = ["SF", "S0", "REJ", "RSTO", "RSTR", "OTH"]

export function ThreatDetector() {
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

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Cyber Threat Detector
                    </CardTitle>
                    <CardDescription>
                        Analyze network connections for potential security threats
                    </CardDescription>
                </CardHeader>
                <CardContent>
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

            {result && (
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
        </div>
    )
}