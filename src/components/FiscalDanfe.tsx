import type { Note } from '../domain/note'
import { formatMoney, formatNoteDate, formatNoteNumber } from '../notePresentation'

function Box({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`danfe-box ${wide ? 'danfe-box--wide' : ''}`}>
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )
}

export function FiscalDanfe({ note }: { note: Note }) {
  const details = note.fiscal!
  const issuedDate = formatNoteDate(note.issuedAt)
  return (
    <>
      <p className="danfe-mobile-hint">Deslize o documento para ver todos os campos →</p>
      <div className="danfe-scroll">
        <article
          className="danfe-sheet"
          aria-label={`DANFE simulado número ${formatNoteNumber(note.number)}`}
        >
          <div className="danfe-watermark" aria-hidden="true">
            SEM VALOR FISCAL
          </div>
          <div className="danfe-top-warning">
            AMBIENTE DE HOMOLOGAÇÃO SIMULADO · DOCUMENTO NÃO AUTORIZADO · SEM VALOR FISCAL
          </div>
          <div className="danfe-receipt">
            <span>
              RECEBEMOS DE {note.issuerName.toUpperCase()} OS PRODUTOS / SERVIÇOS CONSTANTES NESTA
              NOTA SIMULADA.
            </span>
            <strong>
              NF-e Nº {formatNoteNumber(note.number)} · SÉRIE {details.series.padStart(3, '0')}
            </strong>
          </div>
          <div className="danfe-header">
            <div className="danfe-issuer">
              <strong>{note.issuerName}</strong>
              <span>{details.issuerAddress || 'Endereço não informado'}</span>
              <span>
                {[details.issuerCity, details.issuerState, details.issuerZip]
                  .filter(Boolean)
                  .join(' · ') || 'Município / UF / CEP não informados'}
              </span>
            </div>
            <div className="danfe-identity">
              <strong>DANFE</strong>
              <span>DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</span>
              <small>
                0 - ENTRADA &nbsp; 1 - SAÍDA <b>1</b>
              </small>
              <b>Nº {formatNoteNumber(note.number)}</b>
              <small>SÉRIE {details.series.padStart(3, '0')} · FOLHA 01/01</small>
            </div>
            <div className="danfe-access">
              <span>CHAVE DE ACESSO</span>
              <strong>NÃO GERADA — SIMULAÇÃO</strong>
              <span>PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
              <strong>NÃO AUTORIZADO PELA SEFAZ</strong>
            </div>
          </div>
          <div className="danfe-grid danfe-grid--three">
            <Box label="NATUREZA DA OPERAÇÃO" value={details.natureOperation} wide />
            <Box label="INSCRIÇÃO ESTADUAL" value={details.issuerStateRegistration} />
            <Box label="CNPJ / CPF DO EMITENTE" value={details.issuerDocument} />
          </div>
          <h2 className="danfe-section-title">DESTINATÁRIO / REMETENTE</h2>
          <div className="danfe-grid danfe-grid--three">
            <Box label="NOME / RAZÃO SOCIAL" value={note.recipient} wide />
            <Box label="CNPJ / CPF" value={details.recipientDocument} />
            <Box label="DATA DA EMISSÃO" value={issuedDate} />
          </div>
          <div className="danfe-grid danfe-grid--three">
            <Box label="ENDEREÇO" value={details.recipientAddress} wide />
            <Box
              label="MUNICÍPIO / UF"
              value={[details.recipientCity, details.recipientState].filter(Boolean).join(' / ')}
            />
            <Box label="CEP" value={details.recipientZip} />
          </div>
          <h2 className="danfe-section-title">CÁLCULO DO IMPOSTO · VALORES DEMONSTRATIVOS</h2>
          <div className="danfe-grid danfe-grid--five">
            <Box label="BASE CÁLCULO ICMS" value={formatMoney(details.icmsBaseCents)} />
            <Box label="VALOR ICMS" value={formatMoney(details.icmsCents)} />
            <Box label="VALOR IPI" value={formatMoney(details.ipiCents)} />
            <Box label="VALOR PRODUTOS" value={formatMoney(details.productsCents)} />
            <Box label="VALOR TOTAL DA NOTA" value={formatMoney(details.totalCents)} />
          </div>
          <div className="danfe-grid danfe-grid--four">
            <Box label="VALOR DO FRETE" value={formatMoney(details.freightCents)} />
            <Box label="VALOR DO SEGURO" value={formatMoney(details.insuranceCents)} />
            <Box label="DESCONTO" value={formatMoney(details.discountCents)} />
            <Box label="OUTRAS DESPESAS" value={formatMoney(details.otherCents)} />
          </div>
          <h2 className="danfe-section-title">TRANSPORTADOR / VOLUMES TRANSPORTADOS</h2>
          <div className="danfe-grid danfe-grid--three">
            <Box label="NOME / RAZÃO SOCIAL" value={details.carrierName} wide />
            <Box label="FRETE POR CONTA" value={details.freightMode} />
            <Box label="FORMA DE PAGAMENTO" value={details.paymentMethod} />
          </div>
          <h2 className="danfe-section-title">DADOS DOS PRODUTOS / SERVIÇOS</h2>
          <table className="danfe-items">
            <thead>
              <tr>
                <th>CÓD.</th>
                <th>DESCRIÇÃO</th>
                <th>NCM</th>
                <th>CST</th>
                <th>CFOP</th>
                <th>UN</th>
                <th>QTD</th>
                <th>V. UNIT.</th>
                <th>V. TOTAL</th>
                <th>ALÍQ. ICMS</th>
                <th>ALÍQ. IPI</th>
              </tr>
            </thead>
            <tbody>
              {details.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.code}</td>
                  <td>{item.description}</td>
                  <td>{item.ncm || '—'}</td>
                  <td>{item.cst || '—'}</td>
                  <td>{item.cfop || '—'}</td>
                  <td>{item.unit}</td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unitPriceCents)}</td>
                  <td>{formatMoney(Math.round(item.quantity * item.unitPriceCents))}</td>
                  <td>{item.icmsRate}%</td>
                  <td>{item.ipiRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="danfe-section-title">DADOS ADICIONAIS</h2>
          <div className="danfe-additional">
            <div>
              <span>INFORMAÇÕES COMPLEMENTARES</span>
              <p>{details.additionalInfo || '—'}</p>
              <strong>
                SEM VALOR FISCAL. Simulação local: não é uma NF-e, não possui XML autorizado, chave
                de acesso ou protocolo da SEFAZ.
              </strong>
            </div>
            <div>
              <span>RESERVADO AO FISCO</span>
              <p>Não aplicável à simulação.</p>
            </div>
          </div>
        </article>
      </div>
    </>
  )
}
