<?xml version="1.0"?>

<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:pipp="http://pajhome.org.uk/web/pipp/xml-namespace"
  extension-element-prefixes="pipp"
  version="1.0">
<xsl:import href="pipp-core.xsl"/>
<xsl:output indent="no" method="html"/>

<!--
 ! This is the main template
 !-->
<xsl:template match="/pipp/body">

  <!--
   ! Copy all files used by the stylesheet to output
   !-->
  <xsl:value-of select="pipp:file('/styles/common.css')"/>
  <xsl:if test="pipp:import('style') = 'blue-white'">
      <xsl:value-of select="pipp:file('/styles/blue-white.css')"/>
      <xsl:value-of select="pipp:file('/styles/blue-white-pattern.gif')"/>
  </xsl:if>
  <xsl:if test="pipp:import('style') = 'rave'">
      <xsl:value-of select="pipp:file('/styles/rave.css')"/>
      <xsl:value-of select="pipp:file('/styles/rave-pattern.gif')"/>
      <xsl:value-of select="pipp:file('/styles/rave-background.jpg')"/>
  </xsl:if>

  <!--
   ! Create the HTML header, containing title, meta tags, etc.
   !-->
  <html>
    <head>
      <title><xsl:value-of select="pipp:import-join('title', ': ')"/></title>
      <meta name="keywords" content="{pipp:import('keywords')}"/>
      <meta name="description" content="{pipp:import('desc')}"/>
      <link rel="stylesheet" href="{pipp:relative-path('/styles/common.css')}"/>
      <link rel="stylesheet" href="{pipp:relative-path(concat('/styles/', pipp:import('style'), '.css'))}"/>
      <xsl:if test="@target"><base target="{@target}"/></xsl:if>
    </head>
    <body>
      <xsl:value-of disable-output-escaping="yes" select="pipp:map-view('/breadcrumb.xsl')"/>
      <div class="clearit"/>
      <table style="width:100%; border-collapse: collapse">
        <!--
         ! Create the side bar
         !-->
        <tr>
        <td style="width:170px">
            <xsl:variable name="logo" select="concat('/logos/', pipp:import('logo'))"/>
            <xsl:value-of select="pipp:file($logo)"/>
            <xsl:if test="pipp:import('style') = 'blue-white'">
                <a href="{pipp:relative-path('/site/logos.html')}"><img src="{pipp:relative-path($logo)}" width="{pipp:image-width($logo)}" height="{pipp:image-height($logo)}" alt="" style="border:none"/></a>
            </xsl:if>
            <xsl:if test="pipp:import('style') = 'rave'">
                <img src="{pipp:relative-path($logo)}" width="{pipp:image-width($logo)}" height="{pipp:image-height($logo)}" alt="" style="border:none"/>
            </xsl:if>
          <p style="text-align:center">
            <xsl:if test="@sidebar">
              <xsl:apply-templates/>
            </xsl:if>
          </p>
          <xsl:copy-of select="/pipp/advert/*"/>

          <!--
           ! Google AdSense
           !-->
          <p style="text-align:center">
            <script type="text/javascript">
            google_ad_client = "pub-3545889579815990";
            google_ad_width = 120;
            google_ad_height = 240;
            google_ad_format = "120x240_as";
            google_ad_channel ="";
            </script>
            <script type="text/javascript"
              src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
            </script>
          </p>

          <xsl:if test="not(contains(pipp:import('title'), 'Home'))">
              <p style="text-align:left">Play real money casino games on the leading <a href="http://www.gamentor.com/">online casinos</a> and <a href="http://www.seekandplay.com/">online poker rooms</a></p>
          </xsl:if>
        </td>

        <!--
         ! Create the main body of the page
         !-->
        <xsl:if test="not(@sidebar)">
          <td>
            <xsl:variable name="status" select="pipp:import('status')"/>
            <xsl:choose>
              <xsl:when test="$status = 'old'">
                <div class="status"><span class="title">Old Content</span> &#160; This page is now considerably out-of-date.</div>
              </xsl:when>
              <xsl:when test="$status = 'unfinished'">
                <div class="status"><span class="title">Unfinished Content</span> &#160; This page needs some work; contributions are welcome!</div>
              </xsl:when>
            </xsl:choose>
            <xsl:call-template name="h1">
              <xsl:with-param name="text"><xsl:value-of select="pipp:import('title')"/></xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates/>
            <xsl:call-template name="hr"/>
            <div style="margin-top:0.5em;">&#169; 1998 - 2009
            <img src="{pipp:relative-path('/logos/email.png')}" style="border:none" alt="" width="{pipp:image-width('/logos/email.png')}" height="{pipp:image-height('/logos/email.png')}"/>
            <a href="mailto:paj@pajhome.org.uk">Paul Johnston</a>, distributed under the <a href="{pipp:relative-path('/site/legal.html')}#bsdlicense">BSD License</a> &#160; <b>Updated:</b> <xsl:value-of select="pipp:file-time('%d %b %Y')"/></div>
          </td>
        </xsl:if>
      </tr></table>
    </body>
  </html>
</xsl:template>

<!--
 ! Display top level headings as graphics
 !-->
<xsl:template match="h1" name="h1">
  <xsl:param name="text" select="text()"/>

  <xsl:variable name="src">
    <xsl:if test="pipp:import('style') = 'blue-white'">
      <xsl:value-of select="pipp:gtitle('/styles/iglook.ttf', 50, '/styles/blue-white-pattern.gif', '#FFFFFF', $text)"/>
    </xsl:if>
    <xsl:if test="pipp:import('style') = 'rave'">
      <xsl:value-of select="pipp:gtitle('/styles/yoinks.ttf', 70, '/styles/rave-pattern.gif', '#000000', $text)"/>
    </xsl:if>
  </xsl:variable>

  <div style="text-align:center">
    <img src="{$src}" alt="{$text}" width="{pipp:image-width($src)}" height="{pipp:image-height($src)}"/>
  </div>
</xsl:template>

<!--
 ! These templates provide workarounds for CSS limitations:
 | <hr>s end up with an ugly border.
 !-->
<xsl:template match="hr" name="hr">
  <table class="hr"><tr><td/></tr></table>
</xsl:template>

<!--
 ! These templates are just shortcuts to save typing
 !-->
<xsl:template match="imp">
  <xsl:value-of select="pipp:file('arrow.gif')"/>
  <img src="arrow.gif" alt="=&gt;" width="{pipp:image-width('arrow.gif')}" height="{pipp:image-height('arrow.gif')}"/>
</xsl:template>

<xsl:template match="ne">
  <xsl:value-of select="pipp:file('noteq.gif')"/>
  <img src="noteq.gif" alt="!=" width="{pipp:image-width('noteq.gif')}" height="{pipp:image-height('noteq.gif')}"/>
</xsl:template>

<!--
 ! Put logos by external/email links
 !-->
<xsl:template match="a">
    <xsl:if test="@href">
        <xsl:value-of select="pipp:link(@href)"/>
    </xsl:if>
    <a>
        <xsl:apply-templates select="@*[name() != 'noimg']"/>
        <xsl:if test="starts-with(@href, 'mailto') and not(@noimg)">
            <xsl:value-of select="pipp:file('/logos/email.png')"/>
            <img src="{pipp:relative-path('/logos/email.png')}" alt="" style="border:none" width="{pipp:image-width('/logos/email.png')}" height="{pipp:image-height('/logos/email.png')}"/>
        </xsl:if>
        <xsl:if test="starts-with(@href, 'http') and not(@noimg)">
            <xsl:value-of select="pipp:file('/logos/elink.png')"/>
            <img src="{pipp:relative-path('/logos/elink.png')}" alt="" style="border:none" width="{pipp:image-width('/logos/elink.png')}" height="{pipp:image-height('/logos/elink.png')}"/>
        </xsl:if>
        <xsl:apply-templates/>
    </a>
</xsl:template>

</xsl:stylesheet>
