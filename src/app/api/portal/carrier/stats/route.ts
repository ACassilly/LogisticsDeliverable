import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withAuth } from '@/server/middlewares';
import { connectDB } from '@/server/db';
import Booking, { BookingStatus } from '@/server/db/models/booking.model';

async function handler(request: NextRequest) {
  try {
    await connectDB();

    // Get authenticated user
    const user = request.user;
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // Aggregate stats by carrier
    const stats = await Booking.aggregate([
      { $match: { status: { $in: [BookingStatus.PAID, BookingStatus.PENDING_PAYMENT] } } },
      {
        $group: {
          _id: '$carrierName',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalRate' },
          paidBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.PAID] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.PENDING_PAYMENT] }, 1, 0] } },
          averageRate: { $avg: '$totalRate' },
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: stats.map(stat => ({
        carrierName: stat._id,
        totalBookings: stat.totalBookings,
        totalRevenue: stat.totalRevenue,
        paidBookings: stat.paidBookings,
        pendingBookings: stat.pendingBookings,
        averageRate: Math.round(stat.averageRate * 100) / 100,
      })),
      message: 'Carrier stats retrieved successfully'
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(handler);