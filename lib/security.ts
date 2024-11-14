"use client";

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { env } from './config';
import { AppError } from './error';

const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE = 'csrf_token';

export class Security {
  static generateCsrfToken(): string {
    return nanoid(32);
  }

  static async validateCsrfToken(request: NextRequest): Promise<void> {
    if (env.NODE_ENV !== 'production') return;

    const token = request.headers.get(CSRF_HEADER);
    const cookie = request.cookies.get(CSRF_COOKIE);

    if (!token || !cookie || token !== cookie.value) {
      throw AppError.Unauthorized('Invalid CSRF token');
    }
  }

  static setCsrfToken(response: NextResponse): void {
    if (env.NODE_ENV !== 'production') return;

    const token = this.generateCsrfToken();
    response.headers.set(CSRF_HEADER, token);
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  static validateOrigin(request: NextRequest): void {
    if (env.NODE_ENV !== 'production') return;

    const origin = request.headers.get('origin');
    const allowedOrigins = [env.NEXT_PUBLIC_APP_URL];

    if (!origin || !allowedOrigins.includes(origin)) {
      throw AppError.Unauthorized('Invalid origin');
    }
  }
}