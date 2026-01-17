import { NextRequest, NextResponse } from 'next/server';
import { getMerchantInvoiceCreatedLogs, getInvoice } from '@/lib/contracts';
import { invoiceManagerAddress } from '@/lib/wagmi';
import { logger } from '@avax-usdc-invoices/shared';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const merchant = searchParams.get('merchant');

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant address is required' }, { status: 400 });
  }

  if (!invoiceManagerAddress) {
    return NextResponse.json(
      { error: 'Invoice manager contract address not configured' },
      { status: 500 }
    );
  }

  try {
    const logs = await getMerchantInvoiceCreatedLogs(
      merchant as `0x${string}`,
      invoiceManagerAddress
    );

    const invoices = await Promise.all(
      logs.map(async (log) => {
        const invoice = await getInvoice(
          log.args.invoiceId as `0x${string}`,
          invoiceManagerAddress
        );
        return {
          invoiceId: log.args.invoiceId,
          uuid: log.args.invoiceId,
          ...invoice,
        };
      })
    );

    return NextResponse.json({ invoices });
  } catch (error) {
    logger.error('Error fetching invoices', error as Error, { merchant });
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
