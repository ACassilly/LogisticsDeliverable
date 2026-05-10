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

    // Aggregate stats for the shipper
    const stats = await Booking.aggregate([
      { $match: { email: user.email, status: { $in: [BookingStatus.PAID, BookingStatus.PENDING_PAYMENT] } } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalRate' },
          paidBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.PAID] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', BookingStatus.PENDING_PAYMENT] }, 1, 0] } },
          averageRate: { $avg: '$totalRate' },
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      paidBookings: 0,
      pendingBookings: 0,
      averageRate: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        totalBookings: result.totalBookings,
        totalRevenue: result.totalRevenue,
        paidBookings: result.paidBookings,
        pendingBookings: result.pendingBookings,
        averageRate: Math.round(result.averageRate * 100) / 100,
      },
      message: 'Shipper stats retrieved successfully'
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(handler);