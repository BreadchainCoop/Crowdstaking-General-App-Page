import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { ArrowUpDown, ExternalLink, ChevronDown, Sun, Moon, HelpCircle, Wallet, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/toaster';

export default function App() {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [distributionAmount, setDistributionAmount] = useState(282.8420);
  const [progressValue, setProgressValue] = useState(20);
  const [daysRemaining, setDaysRemaining] = useState(25);
  const [isTransacting, setIsTransacting] = useState(false);
  const [walletBalance, setWalletBalance] = useState({
    xDAI: 1247.50,
    TOKEN: 892.30
  });
  const [transactionHash, setTransactionHash] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  // Mock exchange rate
  const exchangeRate = 1.05; // 1 xDAI = 1.05 TOKEN

  // Generate mock transaction hash
  const generateTxHash = () => {
    return '0x' + Math.random().toString(16).substr(2, 64);
  };

  // Validate transaction amount
  const validateAmount = (amount: string, token: string) => {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    
    const currentBalance = token === 'xDAI' ? walletBalance.xDAI : walletBalance.TOKEN;
    if (numAmount > currentBalance) {
      return `Insufficient ${token} balance`;
    }
    
    return null;
  };

  // Handle transaction simulation
  const handleTransaction = async (type: 'allocate' | 'withdraw') => {
    const payToken = isSwapped ? 'TOKEN' : 'xDAI';
    const receiveToken = isSwapped ? 'xDAI' : 'TOKEN';
    
    // For withdraw tab, the tokens are reversed
    const actualPayToken = type === 'withdraw' ? 'TOKEN' : payToken;
    const actualReceiveToken = type === 'withdraw' ? 'xDAI' : receiveToken;
    
    const error = validateAmount(payAmount, actualPayToken);
    if (error) {
      toast.error(error);
      return;
    }

    setIsTransacting(true);
    const txHash = generateTxHash();
    setTransactionHash(txHash);
    
    try {
      // Simulate transaction steps
      toast.loading('Preparing transaction...', { id: txHash });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.loading('Confirming transaction...', { id: txHash });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        // Update balances
        const payAmountNum = Number(payAmount);
        const receiveAmountNum = Number(receiveAmount);
        
        setWalletBalance(prev => ({
          ...prev,
          [actualPayToken]: prev[actualPayToken as keyof typeof prev] - payAmountNum,
          [actualReceiveToken]: prev[actualReceiveToken as keyof typeof prev] + receiveAmountNum
        }));
        
        toast.success(`${type === 'allocate' ? 'Allocation' : 'Withdrawal'} successful!`, { 
          id: txHash,
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
          action: {
            label: 'View Receipt',
            onClick: () => setShowReceipt(true)
          }
        });
        
        // Update distribution amount for allocations
        if (type === 'allocate') {
          setDistributionAmount(prev => prev + payAmountNum * 0.1);
        }
        
        // Clear form
        setPayAmount('');
        setReceiveAmount('');
        
      } else {
        toast.error('Transaction failed', { 
          id: txHash,
          description: 'Network congestion. Please try again.'
        });
      }
      
    } catch (error) {
      toast.error('Transaction failed', { 
        id: txHash,
        description: 'An unexpected error occurred.'
      });
    } finally {
      setIsTransacting(false);
    }
  };

  // Enhanced connect function with toast
  const handleConnect = async () => {
    setIsConnecting(true);
    toast.loading('Connecting to wallet...', { id: 'wallet-connect' });
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate occasional connection failures
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      setIsConnected(true);
      toast.success('Wallet connected successfully!', { 
        id: 'wallet-connect',
        description: 'Address: 0x1234...5678'
      });
    } else {
      toast.error('Failed to connect wallet', { 
        id: 'wallet-connect',
        description: 'Please check your wallet and try again.'
      });
    }
    
    setIsConnecting(false);
  };

  // Enhanced disconnect function with toast
  const handleDisconnect = () => {
    setIsConnected(false);
    toast.info('Wallet disconnected', {
      description: 'You can reconnect anytime.'
    });
  };

  // Handle swap with toast feedback
  const handleSwap = () => {
    setIsSwapped(!isSwapped);
    setPayAmount(receiveAmount);
    setReceiveAmount(payAmount);
    toast.info('Tokens swapped', {
      description: `Now ${!isSwapped ? 'paying with TOKEN' : 'paying with xDAI'}`
    });
  };

  // Copy transaction hash
  const copyTxHash = () => {
    navigator.clipboard.writeText(transactionHash);
    toast.success('Transaction hash copied!');
  };

  // Timer for distribution amount increase
  useEffect(() => {
    const timer = setInterval(() => {
      setDistributionAmount(prev => prev + (Math.random() * 0.01 + 0.005)); // Increase by 0.005-0.015 every second
      setProgressValue(prev => {
        const newValue = prev + 0.1;
        if (newValue >= 100) {
          setDaysRemaining(30); // Reset cycle
          return 5;
        }
        return newValue;
      });
      setDaysRemaining(prev => Math.max(0, prev - (1/86400))); // Decrease very slowly
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle amount input changes
  useEffect(() => {
    if (payAmount && !isNaN(Number(payAmount))) {
      const calculated = isSwapped 
        ? (Number(payAmount) / exchangeRate).toFixed(4)
        : (Number(payAmount) * exchangeRate).toFixed(4);
      setReceiveAmount(calculated);
    } else if (!payAmount) {
      setReceiveAmount('');
    }
  }, [payAmount, isSwapped]);

  const faqItems = [
    {
      question: "How does the interest generation work?",
      answer: "The allocation system pools your group's funds together and uses them to generate interest through overcollateralized lending. The accumulated interest is then distributed proportionally to all participants based on their principal amount. Then you distribute your funds to your shared goal."
    },
    {
      question: "What are the benefits of participating?",
      answer: "By participating, you fundraise for free by generating interest on principal amount. You then can use the interest generated to fund a cause or goal meaningful to you."
    },
    {
      question: "How is the interest rate determined?",
      answer: "Interest rates are determined by market forces and the underlying value of the pooled assets. The exchange rate fluctuates based on supply, demand, and the performance of the underlying interest-generating strategies."
    },
    {
      question: "Can I withdraw my principal amount at anytime?",
      answer: "Yes, you can withdraw your principal amount at at any time. Note that when you withdraw your funds, you stop earning interest."
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#DC7C44] rounded"></div>
            <span className="text-lg text-[#065f46] font-akzidenz">Your Logo Here</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            {!isConnected ? (
              <Button 
                className="bg-[#DC7C44] hover:bg-[#E35300] text-white rounded-lg text-lg"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet size={16} />
                    Connect
                  </div>
                )}
              </Button>
            ) : (
              <Button 
                className="bg-[#065f46] hover:bg-[#065f46]/90 text-white rounded-lg text-lg"
                onClick={handleDisconnect}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Connected
                </div>
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Title and Stats */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#065f46] font-['Kufam']">Allocate Your Interest</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allocation Card */}
            <Card className="p-6 space-y-6 bg-[#F3EDE6] shadow-lg rounded-xl border-0">
              <Tabs defaultValue="allocate" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-[#F3EDE6] rounded-lg p-1">
                  <TabsTrigger value="allocate" className="data-[state=active]:bg-[#DC7C44] data-[state=active]:text-white rounded-md text-lg">
                    Allocate
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#DC7C44] data-[state=active]:text-white rounded-md text-lg">
                    Withdraw
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="allocate" className="space-y-6">
                  {/* Wallet Balance Display */}
                  {isConnected && (
                    <div className="p-3 bg-white/50 rounded-lg border border-[#065f46]/10">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#065f46]/70">Wallet Balance:</span>
                        <div className="flex gap-4">
                          <span className="text-[#065f46]">✗ {walletBalance.xDAI.toFixed(2)} xDAI</span>
                          <span className="text-[#065f46]">💎 {walletBalance.TOKEN.toFixed(2)} TOKEN</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-lg text-[#065f46]/70 dark:text-gray-400">You pay</label>
                        {isConnected && (
                          <button 
                            className="text-sm text-[#DC7C44] hover:text-[#E35300]"
                            onClick={() => {
                              const maxBalance = isSwapped ? walletBalance.TOKEN : walletBalance.xDAI;
                              setPayAmount(maxBalance.toString());
                            }}
                          >
                            Max: {isSwapped ? walletBalance.TOKEN.toFixed(2) : walletBalance.xDAI.toFixed(2)}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="text-4xl border-0 shadow-none p-0 bg-transparent text-[#065f46] font-bold"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          disabled={isTransacting}
                        />
                        <Badge variant="outline" className={`flex items-center gap-1 text-lg ${isSwapped ? 'bg-[#DC7C44]/10 border-[#DC7C44]/30 text-[#DC7C44]' : 'bg-[#F3EDE6] border-[#065f46]/30 text-[#065f46]'} rounded-md`}>
                          {isSwapped ? '💎 TOKEN' : '✗ xDAI'}
                        </Badge>
                      </div>
                      {/* Validation Error */}
                      {payAmount && isConnected && validateAmount(payAmount, isSwapped ? 'TOKEN' : 'xDAI') && (
                        <div className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle size={14} />
                          {validateAmount(payAmount, isSwapped ? 'TOKEN' : 'xDAI')}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-lg border-[#065f46]/30 text-[#065f46] hover:bg-[#065f46]/10"
                        onClick={handleSwap}
                        disabled={isTransacting}
                      >
                        <ArrowUpDown size={20} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-lg text-[#065f46]/70 dark:text-gray-400">You receive</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={receiveAmount}
                          readOnly
                          className="text-4xl border-0 shadow-none p-0 bg-transparent text-[#065f46] font-bold"
                          placeholder="0.00"
                        />
                        <Badge variant="outline" className={`flex items-center gap-1 text-lg ${!isSwapped ? 'bg-[#DC7C44]/10 border-[#DC7C44]/30 text-[#DC7C44]' : 'bg-[#F3EDE6] border-[#065f46]/30 text-[#065f46]'} rounded-md`}>
                          {!isSwapped ? '💎 TOKEN' : '✗ xDAI'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {!isConnected ? (
                    <Button 
                      className="w-full bg-[#DC7C44] hover:bg-[#E35300] text-white py-3 rounded-lg text-lg"
                      onClick={handleConnect}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Connecting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Wallet size={20} />
                          Connect Wallet
                        </div>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-[#DC7C44] hover:bg-[#E35300] text-white py-3 rounded-lg text-lg"
                        onClick={() => handleTransaction('allocate')}
                        disabled={!payAmount || Number(payAmount) <= 0 || isTransacting || validateAmount(payAmount, isSwapped ? 'TOKEN' : 'xDAI') !== null}
                      >
                        {isTransacting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            Allocate Tokens
                          </div>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full text-lg"
                        onClick={handleDisconnect}
                        disabled={isTransacting}
                      >
                        Disconnect (0x1234...5678)
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-6">
                  {/* Wallet Balance Display */}
                  {isConnected && (
                    <div className="p-3 bg-white/50 rounded-lg border border-[#065f46]/10">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#065f46]/70">Wallet Balance:</span>
                        <div className="flex gap-4">
                          <span className="text-[#065f46]">✗ {walletBalance.xDAI.toFixed(2)} xDAI</span>
                          <span className="text-[#065f46]">💎 {walletBalance.TOKEN.toFixed(2)} TOKEN</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-lg text-[#065f46]/70 dark:text-gray-400">You withdraw</label>
                        {isConnected && (
                          <button 
                            className="text-sm text-[#DC7C44] hover:text-[#E35300]"
                            onClick={() => {
                              setPayAmount(walletBalance.TOKEN.toString());
                            }}
                          >
                            Max: {walletBalance.TOKEN.toFixed(2)}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="text-4xl border-0 shadow-none p-0 bg-transparent text-[#065f46] font-bold"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          disabled={isTransacting}
                        />
                        <Badge variant="outline" className="flex items-center gap-1 text-lg bg-[#DC7C44]/10 border-[#DC7C44]/30 text-[#DC7C44] rounded-md">
                          💎 TOKEN
                        </Badge>
                      </div>
                      {/* Validation Error */}
                      {payAmount && isConnected && validateAmount(payAmount, 'TOKEN') && (
                        <div className="flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle size={14} />
                          {validateAmount(payAmount, 'TOKEN')}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-lg border-[#065f46]/30 text-[#065f46] hover:bg-[#065f46]/10"
                        disabled={isTransacting}
                      >
                        <ArrowUpDown size={20} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-lg text-[#065f46]/70 dark:text-gray-400">You receive</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={receiveAmount}
                          readOnly
                          className="text-4xl border-0 shadow-none p-0 bg-transparent text-[#065f46] font-bold"
                          placeholder="0.00"
                        />
                        <Badge variant="outline" className="flex items-center gap-1 text-lg bg-[#F3EDE6] border-[#065f46]/30 text-[#065f46] rounded-md">
                          ✗ xDAI
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {!isConnected ? (
                    <Button 
                      className="w-full bg-[#DC7C44] hover:bg-[#E35300] text-white py-3 rounded-lg text-lg"
                      onClick={handleConnect}
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-[#DC7C44] hover:bg-[#E35300] text-white py-3 rounded-lg text-lg"
                        onClick={() => handleTransaction('withdraw')}
                        disabled={!payAmount || Number(payAmount) <= 0 || isTransacting || validateAmount(payAmount, 'TOKEN') !== null}
                      >
                        {isTransacting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            Withdraw Tokens
                          </div>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full text-lg"
                        onClick={handleDisconnect}
                        disabled={isTransacting}
                      >
                        Disconnect (0x1234...5678)
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Distribution Card */}
            <Card className="p-6 space-y-6 bg-[#F3EDE6] shadow-lg rounded-xl border-0">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl text-[#065f46]/70 tracking-wide font-['Kufam']">AMOUNT TO DISTRIBUTE</h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-[#DC7C44] rounded-full flex items-center justify-center text-white">
                        💎
                      </div>
                      <span className="text-5xl font-bold text-[#065f46]">{distributionAmount.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg text-[#065f46]/70">Current accumulated interest</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle size={18} className="text-[#065f46]/50" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This amount increases continuously as the protocol generates interest from your allocated tokens.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#065f46]/20"></div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-[#065f46]/70">Estimated after 30 days</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#DC7C44] rounded-full flex items-center justify-center text-white text-xs">
                        💎
                      </div>
                      <span className="font-bold text-lg text-[#065f46]">{(distributionAmount * 7.3).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg text-[#065f46]/70">DAI savings rate (APY)</span>
                    <span className="font-bold text-lg text-[#065f46]">5.70%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg text-[#065f46]/70">Cycle #15</span>
                    <span className="font-bold text-lg text-[#065f46]">Aug 12th - Sep 11th</span>
                  </div>
                </div>

                <div className="h-px bg-[#065f46]/20"></div>

                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-[#065f46] font-['Kufam']">Distributing in {Math.ceil(daysRemaining)} days</h3>
                  <Progress value={progressValue} className="h-2 bg-[#065f46]/20">
                    <div className="h-full bg-gradient-to-r from-[#DC7C44] to-[#E35300] rounded-full transition-all" style={{ width: `${progressValue}%` }}></div>
                  </Progress>
                </div>

                <div className="flex items-center justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 text-lg text-[#DC7C44] hover:text-[#E35300] transition-colors">
                        <span>How does this work?</span>
                        <ExternalLink size={18} />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>How Distribution Works</DialogTitle>
                        <DialogDescription className="space-y-3 pt-4">
                          <p>The distribution system works in monthly cycles:</p>
                          <ol className="list-decimal list-inside space-y-2">
                            <li>Your allocated tokens generate interest through various DeFi protocols</li>
                            <li>Accumulated interest is pooled and distributed proportionally</li>
                            <li>At the end of each cycle, rewards are automatically distributed to your wallet</li>
                            <li>You can compound your rewards by re-allocating them</li>
                          </ol>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-[#065f46] font-['Kufam']">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((question, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#F3EDE6] dark:bg-gray-800 rounded-xl border-0 shadow-md hover:shadow-lg transition-shadow">
                  <span className="font-medium text-lg text-left text-[#065f46]">{question.question}</span>
                  <ChevronDown size={22} className="text-[#065f46]/50" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-white dark:bg-gray-700 rounded-b-xl border-t-0 border">
                  <p className="text-lg text-[#065f46]/70 dark:text-gray-400">
                    {question.answer}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 p-6 bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#DC7C44] rounded"></div>
              <span className="font-bold text-[#065f46] font-akzidenz">Your Logo Here</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button className="text-[#065f46]/70 hover:text-[#065f46] dark:text-gray-400 dark:hover:text-gray-100">
                  𝕏
                </button>
                <button className="text-[#065f46]/70 hover:text-[#065f46] dark:text-gray-400 dark:hover:text-gray-100">
                  📱
                </button>
                <button className="text-[#065f46]/70 hover:text-[#065f46] dark:text-gray-400 dark:hover:text-gray-100">
                  💬
                </button>
                <button className="text-[#065f46]/70 hover:text-[#065f46] dark:text-gray-400 dark:hover:text-gray-100">
                  🐙
                </button>
                <button className="text-[#065f46]/70 hover:text-[#065f46] dark:text-gray-400 dark:hover:text-gray-100">
                  🌿
                </button>
              </div>
              
              <div className="text-sm text-[#065f46]/70 dark:text-gray-400">
                MIT License 2025
              </div>
              
              <div className="flex items-center gap-4">
                <button className="text-sm text-[#065f46]/70 hover:text-[#065f46] dark:text-gray-400 dark:hover:text-gray-100">
                  Join our newsletter ↗
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* Transaction Receipt Dialog */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Transaction Receipt
              </DialogTitle>
              <DialogDescription>
                Your transaction was completed successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-[#F3EDE6] rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#065f46]/70">Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[#065f46]">
                      {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                    </span>
                    <Button size="icon" variant="ghost" onClick={copyTxHash} className="h-6 w-6">
                      <Copy size={12} />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#065f46]/70">Status:</span>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Confirmed
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#065f46]/70">Network:</span>
                  <span className="text-[#065f46]">Gnosis Chain</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#065f46]/70">Gas Fee:</span>
                  <span className="text-[#065f46]">0.00021 xDAI</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast.info('Explorer feature coming soon!');
                  }}
                >
                  View on Explorer
                </Button>
                <Button 
                  className="flex-1 bg-[#DC7C44] hover:bg-[#E35300]"
                  onClick={() => setShowReceipt(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
}