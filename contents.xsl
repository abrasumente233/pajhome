<?xml version="1.0"?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:pipp="http://pajhome.org.uk/web/pipp/xml-namespace"
    extension-element-prefixes="pipp"
    version="1.0">
<xsl:output indent="yes" method="html"/>

<!--
 ! This template generates the contents from the state XML. It shows the top-level
 ! categories with their logo and a list of second-level topics.
 !-->
<xsl:template match="/page">
    <xsl:value-of select="pipp:export-depend(@src, 'children')"/>
    <table style="width:90%; padding-left:5%"><tr>
        <xsl:for-each select="children/page">
            <xsl:value-of select="pipp:export-depend(@src, 'logo')"/>
            <xsl:value-of select="pipp:export-depend(@src, 'link')"/>
            <xsl:value-of select="pipp:export-depend(@src, 'title')"/>
            <xsl:value-of select="pipp:export-depend(@src, 'children')"/>
            <td style="padding-bottom:0.5em; vertical-align:top; width: 50%">
                <xsl:variable name="xlogo" select="pipp:relative-path(concat('/logos/', (ancestor-or-self::node()/exports/logo)[last()]))"/>
                <xsl:variable name="logo" select="concat(substring($xlogo, 0, string-length($xlogo)-3), '_mini.jpg')"/>
                <xsl:value-of select="pipp:file($logo)"/>
                <strong><a href="{pipp:relative-path(exports/link)}">
                    <img width="{pipp:image-width($logo)}" height="{pipp:image-height($logo)}" src="{$logo}" style="border:none; float:left; margin-right: 5px" alt=""/>
                    <xsl:if test="exports/status = 'new'">
                        <xsl:value-of select="pipp:file('/logos/new.png')"/>
                        <img width="{pipp:image-width('/logos/new.png')}" height="{pipp:image-height('/logos/new.png')}" src="{'/logos/new.png'}" style="border: none" title="New content" alt=""/>
                    </xsl:if>
                    <xsl:value-of select="exports/title"/>
                </a></strong><br/>
                <xsl:value-of select="pipp:export-depend(@src, 'desc')"/>
                <xsl:value-of select="exports/desc"/><br/>
                <xsl:for-each select="children/page">
                    <xsl:value-of select="pipp:export-depend(@src, 'link')"/>
                    <xsl:value-of select="pipp:export-depend(@src, 'title')"/>
                    <xsl:value-of select="pipp:export-depend(@src, 'status')"/>
                    <a href="{pipp:relative-path(exports/link)}">
                        <xsl:if test="exports/status = 'new'">
                            <xsl:value-of select="pipp:file('/logos/new.png')"/>
                            <img width="{pipp:image-width('/logos/new.png')}" height="{pipp:image-height('/logos/new.png')}" src="{'/logos/new.png'}" style="border: none" title="New content" alt=""/>
                        </xsl:if>
                        <xsl:value-of select="exports/title"/>
                    </a>
                    <xsl:if test="position() != last()">, </xsl:if>
                </xsl:for-each>
            </td>
            <xsl:if test="position() mod 2 = 0 and position() != last()">
                <xsl:value-of disable-output-escaping="yes" select="'&lt;/tr&gt;&lt;tr&gt;'"/>
            </xsl:if>
        </xsl:for-each>
    </tr></table>
</xsl:template>

</xsl:stylesheet>
