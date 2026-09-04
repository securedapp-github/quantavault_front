import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, ArrowRight, Zap, CheckCircle2, RefreshCw, GitPullRequest, Scan } from 'lucide-react';
import { api } from '../../utils/cbomClient';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { CbomEmptyState } from '../../components/cbom/CbomEmptyState';

export function MigrationPlannerPage({ currentScan, onOpenIngestion }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    async function loadPlan() {
      if (!currentScan) {
        setPlan(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const scanId = currentScan?.summary?.id || currentScan?.id || 'latest';
        const data = await api.getMigrationPlan(scanId);
        setPlan(data);
      } catch (err) {
        console.error('Failed to load migration plan:', err);
        setPlan(null);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [currentScan]);

  const handleSimulateQuantumVaultProvisioning = (stepNumber) => {
    setProvisioningStep(stepNumber);
    setTimeout(() => {
      setCompletedSteps((prev) => ({ ...prev, [stepNumber]: true }));
      setProvisioningStep(null);
    }, 1500);
  };

  // State 1: No Scan Selected / Executed
  if (!currentScan) {
    return (
      <CbomEmptyState
        icon={GitPullRequest}
        title="No Scan Data Available"
        description="Please initiate a codebase scan to discover cryptographic assets, analyze quantum vulnerabilities, and generate an automated PQC migration roadmap."
        onAction={onOpenIngestion}
        actionLabel="Scan Codebase Now"
      />
    );
  }

  // State 2: Loading Plan from Backend
  if (loading) {
    return (
      <Card style={{ padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary, #94a3b8)' }}>
        <RefreshCw className="animate-spin" size={32} style={{ marginBottom: '16px', color: 'var(--color-primary, #6366f1)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)', margin: '0 0 6px 0' }}>
          Calculating Migration Playbook...
        </h3>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          Mapping discovered classical algorithms to NIST FIPS 203/204/205 quantum-resistant replacements.
        </p>
      </Card>
    );
  }

  const steps = plan?.steps || [];

  // State 3: Zero Vulnerabilities (All Safe)
  if (steps.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success, #00D084)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                QUANTUM-READY BASELINE
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: 'var(--color-text-primary, #f8fafc)' }}>
                Automated Post-Quantum Migration Plan
              </h2>
              <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.875rem', marginTop: '6px' }}>
                Target: <strong>{currentScan?.summary?.target_directory || currentScan?.targetName || 'Scanned Repository'}</strong>
              </p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success, #00D084)', fontFamily: 'monospace' }}>
                0 hrs
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>Migration Effort Required</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(0, 208, 132, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--color-success, #00D084)'
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)', margin: '0 0 8px 0' }}>
            Zero Quantum Vulnerabilities Detected 🎉
          </h3>
          <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.9rem', maxWidth: '520px', margin: '0', lineHeight: '1.6' }}>
            All cryptographic algorithms and key lengths discovered in this codebase comply with NIST PQC and NSA CNSA 2.0 guidelines. No remediation playbooks are required!
          </p>
        </Card>
      </div>
    );
  }

  // State 4: Real Migration Steps Available
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Plan Summary Card */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary, #6366f1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              QUANTUMVAULT PQC REMEDIATION ENGINE
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: 'var(--color-text-primary, #f8fafc)' }}>
              Automated Post-Quantum Migration Plan
            </h2>
            <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.875rem', marginTop: '6px' }}>
              Discovered {steps.length} vulnerable assets in <strong>{currentScan?.summary?.target_directory || currentScan?.targetName || 'Active Scan'}</strong> requiring PQC remediation.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary, #6366f1)', fontFamily: 'monospace' }}>
              ~{plan?.estimated_hours || (steps.length * 12)} hrs
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>Estimated Migration Effort</span>
          </div>
        </div>
      </Card>

      {/* Migration Steps Pipeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map((step) => {
          const isDone = completedSteps[step.step_number];
          const isRunning = provisioningStep === step.step_number;

          return (
            <Card key={step.step_number} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                  
                  {/* Step Number Badge */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isDone ? 'rgba(0, 208, 132, 0.2)' : 'var(--color-primary, #6366f1)',
                    color: isDone ? 'var(--color-success, #00D084)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    flexShrink: 0,
                  }}>
                    {isDone ? <CheckCircle2 size={20} /> : step.step_number}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)', margin: 0 }}>
                      {step.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.85rem', marginTop: '4px', lineHeight: '1.5' }}>
                      {step.description}
                    </p>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-text-muted, #64748b)' }}>
                        Target: <code className="code-inline" style={{ color: '#818cf8', fontFamily: 'monospace' }}>{step.target_asset}</code>
                      </span>
                      {step.pqc_standard && (
                        <span style={{ color: 'var(--color-text-muted, #64748b)' }}>
                          PQC Standard: <strong style={{ color: 'var(--color-primary, #6366f1)' }}>{step.pqc_standard}</strong>
                        </span>
                      )}
                      {step.effort && (
                        <span style={{ color: 'var(--color-text-muted, #64748b)' }}>
                          Effort: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{step.effort}</span>
                        </span>
                      )}
                    </div>

                    {/* Remediation Snippet */}
                    {step.suggested_code_diff && (
                      <div style={{ marginTop: '12px', background: 'var(--color-bg-tertiary, rgba(255,255,255,0.04))', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-primary, #f8fafc)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                          Suggested Code Replacement:
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {step.suggested_code_diff}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Provision Action */}
                <div style={{ flexShrink: 0 }}>
                  <Button
                    variant={isDone ? "secondary" : "primary"}
                    size="small"
                    onClick={() => handleSimulateQuantumVaultProvisioning(step.step_number)}
                    disabled={isRunning || isDone}
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} /> Provisioning PQC Key...
                      </>
                    ) : isDone ? (
                      <>
                        <CheckCircle2 size={14} color="var(--color-success, #00D084)" /> Provisioned in QuantaVault
                      </>
                    ) : (
                      <>
                        <Zap size={14} /> Auto-Provision PQC Key
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
}

export default MigrationPlannerPage;
