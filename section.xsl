<?xml version="1.0"?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:pipp="http://pajhome.org.uk/web/pipp/xml-namespace"
    extension-element-prefixes="pipp"
    version="1.0">
<xsl:output indent="yes" method="html"/>

<!--
 ! This template generates a section page from the state XML. It shows the
 | children of this page, with their desciption.
 !-->
<xsl:template match="/page">
    <xsl:value-of select="pipp:export-depend(pipp:file-name(), 'children')"/>
    <dl>
        <xsl:for-each select="//page[exports/link=pipp:file-name()]/children/page">
            <xsl:value-of select="pipp:export-depend(@src, 'nonav')"/>
            <xsl:if test="not(exports/nonav)">
                <xsl:value-of select="pipp:export-depend(@src, 'link')"/>
                <xsl:value-of select="pipp:export-depend(@src, 'title')"/>
                <xsl:value-of select="pipp:export-depend(@src, 'desc')"/>
                <xsl:value-of select="pipp:export-depend(@src, 'status')"/>
                <dt>
                    <xsl:if test="exports/status = 'new'">
                        <xsl:value-of select="pipp:file('/logos/new.png')"/>
                        <img width="{pipp:image-width('/logos/new.png')}" height="{pipp:image-height('/logos/new.png')}" src="{'/logos/new.png'}" style="border:none" title="New content" alt=""/>
                    </xsl:if>
                    <xsl:value-of select="exports/title"/>
                </dt>
                <dd><xsl:value-of select="exports/desc"/>&#160;<a href="{pipp:relative-path(exports/link)}">more...</a></dd>
            </xsl:if>
        </xsl:for-each>
    </dl>
</xsl:template>

<xsl:template match="@*|*">
    <xsl:copy>
        <xsl:apply-templates select="*|@*|text()"/>
    </xsl:copy>
</xsl:template>

</xsl:stylesheet>
